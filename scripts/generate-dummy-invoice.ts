import fse from "fs-extra";
import dummyjson from "dummy-json";
import dayjs from "dayjs";
import command_parser from "yargs/yargs";
import path from "path";
import clc from "cli-color";

import { hideBin } from "yargs/helpers";

const BASE_FOLDER_PATH = `${__dirname}/dummy-invoices`;

// Parse command line argument
const argv = command_parser(hideBin(process.argv))
  .option("repeat", {
    type: "number",
    default: 1,
    alias: "r",
    describe: "Set how many dummy invoices to be generated",
  })
  .help()
  .parseSync();

const repeatInterval = Math.floor(argv.repeat); // Determine how much of invoices to be generated

const templateHelper = {
  maturityDate() {
    var maturityDateArr = [];
    // Add 3,6,9,12 maturity month period as selection
    for (let maturityMonth = 3; maturityMonth <= 12; maturityMonth += 3) {
      const maturityDate = dayjs().add(maturityMonth, "month").toISOString();
      maturityDateArr.push(maturityDate);
    }
    return dummyjson.utils.randomArrayItem(maturityDateArr);
  },
};

const template = `
{
    "invoices": [
        {{#repeat ${repeatInterval}}}
        {
            "maturityDate":"{{maturityDate}}",
            "value":{{int 50 100 round=5}},
            "supplier": "{{company}} Pte Ltd",
            "merchant": "{{firstName}}_{{lastName}} Pte Ltd"   
        }
        {{/repeat}}
    ],
    "count": ${repeatInterval}
    
}`;

type Invoice = {
  maturityDate: string;
  value: number;
  supplier: string;
  merchant: string;
};

// cli-color color config
var error = clc.red;
var highlight = clc.blue;

const generateDummyInvoice = () => {
  try {
    // Returns a dummy JSON string based on template
    const result = dummyjson.parse(template, { helpers: templateHelper });

    // Parse string into JSON objects
    const jsonResult = JSON.parse(result);

    // Extract invoices array from JSON result
    const invoiceDetails: Invoice[] = jsonResult.invoices;
    var count = jsonResult.count || 0;

    if (count > 0) {
      // Generate JSON file individually in designated folder till last element of JSON object array
      for (; count > 0; count--) {
        const singleJSONObject = invoiceDetails.shift() as Invoice;

        // Eg: 01JAN2023
        const dateFormat = dayjs(singleJSONObject.maturityDate)
          .format("DDMMMYYYY")
          .toString()
          .toUpperCase();

        const simplifiedMerchantName = singleJSONObject.merchant
          .replace("Pte Ltd", " ")
          .trim();

        const filename = `${BASE_FOLDER_PATH}/${simplifiedMerchantName}_EXP${dateFormat}_${singleJSONObject.value}.json`;
        // Generate filename based on naming convention
        fse.outputJsonSync(`${filename}`, singleJSONObject);
        console.log(
          highlight(path.parse(filename).base),
          `created at`,
          highlight(path.parse(filename).dir)
        );
      }
    } else {
      console.warn(error("Invalid generated dummy JSON data."));
    }
  } catch (err) {
    console.warn(error(`Error: ${err}`));
  }
};

generateDummyInvoice();
