import { ethers } from "hardhat";

async function main() {
  const InvoiceFactoring = await ethers.getContractFactory("InvoiceFactoring");
  // Start deployment, returning a promise that resolves to a contract object
  const invoiceFactoring = await InvoiceFactoring.deploy();

  await invoiceFactoring.deployed();

  console.log(`"Contract deployed to address:", ${invoiceFactoring.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
