import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "./.env") });

const { NODE_API_URL, WALLET_PRIVATE_KEY } = process.env;

const hardhatConfig: HardhatUserConfig = {
  solidity: "0.8.4",
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: NODE_API_URL,
      accounts: [`0x${WALLET_PRIVATE_KEY}`],
    },
  },
};

export default hardhatConfig;
