import axios from "axios";
import FormData from "form-data";
import fse from "fs-extra";
import clc from "cli-color";
import dayjs from "dayjs";
import md5 from "md5";
import { ethers } from "ethers";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "./.env") });

// @ts-ignore
import contract from "../smart-contract/artifacts/contracts/InvoiceFactoring.sol/InvoiceFactoring.json";
import { time } from "console";

// Get Alchemy API Key
const API_KEY = process.env.API_KEY;

// API server related parameter
const API_HOST = "localhost";
const API_PORT = 3000;

// Define an Alchemy Provider
const provider = new ethers.providers.AlchemyProvider("goerli", API_KEY);

// Create a signer
const privateKey = process.env.WALLET_PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey!, provider);

// Get contract ABI and address
const abi = contract.abi;
const contractAddress = process.env.CONTRACT_ADDRESS || "";

// Create a contract instance
const invoiceFactoringContract = new ethers.Contract(
  contractAddress,
  abi,
  signer
);

// cli-color color config
var error = clc.red;
var highlight = clc.blue;

// POST API to upload file to IPFS
const uploadFile = async (file: string) => {
  var isSuccess = false;
  var resData;
  try {
    var formData = new FormData();
    formData.append("file", fse.createReadStream(file));

    var config = {
      method: "POST",
      url: `http://${API_HOST}:${API_PORT}/upload`,
      headers: {
        ...formData.getHeaders(),
      },
      data: formData,
    };

    console.log("Uploading", highlight(file), "to IPFS");
    // POST API operation
    const res = await axios(config);

    if (res.data) {
      resData = res.data;
      isSuccess = true;
      console.log(
        highlight(file),
        `is uploaded to IPFS:`,
        highlight(resData.data.url)
      );
    }
  } catch (err) {
    console.log(error(err));
  }
  return { isSuccess, resData };
};

// Sort file in ascending order based on creation date
const getSortedInputFile = (folderPath: string) => {
  const files = fse.readdirSync(folderPath);

  // Sort mechanism based on created time
  var sortedFileItems =
    files
      .map((fileName) => ({
        name: fileName,
        time: fse.statSync(`${folderPath}${fileName}`).birthtime.getTime(),
      }))
      .sort((a, b) => a.time - b.time)
      .map((file) => file.name) || undefined;

  var fileCount = files.length || 0;

  return { fileCount, sortedFileItems };
};

// Get invoice payment percentage based on credit risk
const getPaymentPercent = () => {
  // TODO: Use algorithm via API/SDK. TBC
  return 0.75;
};

// Generate metadata oject
const generateMetadata = (inputJson: any) => {
  var isGenerated = false;
  var metadata;

  try {
    if (inputJson && typeof inputJson === "object") {
      // Eg: 01JAN2023
      const maturityDateFileFormat = dayjs(inputJson.maturityDate)
        .format("DDMMMYYYY")
        .toString()
        .toUpperCase();

      const simplifiedMerchantName = inputJson.merchant
        .replace("Pte Ltd", " ")
        .trim();

      const currentValue = Math.floor(inputJson.value * getPaymentPercent());
      // JSON structure used by OpenSea

      // Hash merchant name + unix maturity date in unix timestamp
      const offsetMaturityDate = dayjs(maturityDateFileFormat).unix();
      const hashedInfo = md5(`${inputJson.merchant}_${offsetMaturityDate}`);

      const metadataJson = {
        description: "Invoice factoring by Pomelo",
        external_url: "TBC",
        name: `${hashedInfo}_${currentValue}_EXP${maturityDateFileFormat}_${inputJson.value}`,
        attributes: [
          {
            value: `Current value: ${currentValue}`,
          },
          {
            value: `Face value: ${inputJson.value}`,
          },
          {
            display_type: "date",
            trait_type: "issued date",
            value: dayjs().unix(),
          },
          {
            display_type: "date",
            trait_type: "maturity date",
            value: offsetMaturityDate,
          },
        ],
      };
      metadata = metadataJson;
      isGenerated = true;
    }
  } catch (err) {
    console.log(error(`Error:${err}`));
  }
  return { isGenerated, metadata };
};

// Simply checking mechanism and generated metadata file
const generateMetadataFile = (metadataJson: any, imageIpfsUrl: string) => {
  var isGenerated = false;
  var metadataFilename;

  try {
    if (metadataJson && typeof metadataJson === "object") {
      metadataJson.image = imageIpfsUrl;

      const hashedFileName = md5(metadataJson.name);
      const generatedFilename = `${__dirname}/artifacts/${hashedFileName}_metadata.json`;
      // Generate metadata file
      fse.outputJsonSync(generatedFilename, metadataJson);

      // Update parameter if file is generated
      metadataFilename = generatedFilename;
      isGenerated = true;
      console.log(`Metadata file generated at:`, highlight(metadataFilename));
    } else {
      console.warn(`Metadata is not JSON object. Operation abort.`);
    }
  } catch (err) {
    console.log(error(`Error:${err}`));
  }
  return { isGenerated, metadataFilename };
};

// Main function
const mintInvoice = async () => {
  // Make sure contract instance is initiated correctly
  if (
    invoiceFactoringContract.address &&
    (await invoiceFactoringContract.signer.getAddress())
  ) {
    try {
      // Check input folder with any new invoice in JSON format
      const inputFolder = `${__dirname}/dummy-invoices/`;

      const sortedFiles = getSortedInputFile(inputFolder);

      if (sortedFiles.fileCount) {
        const selectedInvoiceFile = `${inputFolder}${sortedFiles.sortedFileItems.shift()}`;

        // Retrieve invoice details
        const invoiceDetails = fse.readJsonSync(selectedInvoiceFile);

        // Build metadata file for OpenSea
        const metadataGenerateStatus = generateMetadata(invoiceDetails);

        if (
          metadataGenerateStatus.isGenerated &&
          metadataGenerateStatus.metadata
        ) {
          // TODO: Generate image based on parameter of invoice
          const imageFile = `${__dirname}/artifacts/yield graph.jpg`;

          const isImageFileExists = await fse.pathExists(imageFile);
          if (isImageFileExists) {
            // Upload image to IPFS
            const imageFileUploadStatus = await uploadFile(imageFile);

            if (
              imageFileUploadStatus.isSuccess &&
              imageFileUploadStatus.resData
            ) {
              // Insert image IPFS CID to metadata JSON file that contains other invoice parameter

              const metadataFileGenerateStatus = generateMetadataFile(
                metadataGenerateStatus.metadata,
                imageFileUploadStatus.resData.data.url
              );
              if (
                metadataFileGenerateStatus.isGenerated &&
                metadataFileGenerateStatus.metadataFilename
              ) {
                // Upload metadata file to IPFS
                const metadataFileUploadStatus = await uploadFile(
                  metadataFileGenerateStatus.metadataFilename
                );
                if (
                  metadataFileUploadStatus.isSuccess &&
                  metadataFileUploadStatus.resData
                ) {
                  // Remove file if uploaded
                  fse.removeSync(selectedInvoiceFile);
                  // Call smart contract mint function
                  console.log(
                    `Minting invoice with smart contract at:`,
                    highlight(
                      `https://goerli.etherscan.io/address/${contractAddress}`
                    )
                  );
                  let InvoiceTxn = await invoiceFactoringContract.safeMint(
                    signer.address,
                    metadataFileUploadStatus.resData.data.url
                  );
                  await InvoiceTxn.wait();
                  console.log(
                    `Invoice minted with transaction at:`,
                    highlight(
                      `https://goerli.etherscan.io/tx/${InvoiceTxn.hash}`
                    )
                  );
                }
              }
            }
          } else {
            console.warn(
              highlight(imageFile),
              `file is missing. Operation abort.`
            );
          }
        }
        // Return JSON object will be use later on based on OpenSea API specification
      } else {
        console.warn(error(`No new invoices detected. Operation abort.`));
      }
    } catch (err) {
      console.log(error(`Error: ${err}`));
    }
  } else {
    console.warn(error(`Contract is not loaded correctly. Operation abort.`));
  }
};

mintInvoice()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
