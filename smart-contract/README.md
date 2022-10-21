# Invoice Factoring MVP - Smart Contract

## Description

Smart contract is a self-executing contract written into lines of code that automate workflow, triggering the next action when conditions are met. The code and the agreements contained therein exist across a distributed, decentralized blockchain network. The code controls the execution, and transactions are trackable and irreversible

Smart contracts permit trusted transactions and agreements to be carried out among disparate, anonymous parties without the need for a central authority, legal system, or external enforcement mechanism.

Implement basic `ERC721 standard` function based on OpenZeppelin.

## Get started

The whole project directory can be break down into few major parts such as:
|folder | Description  
 |:------------:|:------------------------------------------------------------------------------------------
| [`contracts`](contracts/) |Folder that contains smart contract

1. Make sure [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is installed.
2. Git clone the repository to local machine.
3. Make sure [yarn](https://yarnpkg.com/getting-started/migration#why-should-you-migrate) is installed.
4. Enter `yarn install` in terminal to install all required dependencies.
5. Enter `npx hardhat compile` in terminal to generate the artifacts that will be stored in `artifacts` folder. The contents will then be used in [scripts](../scripts).
6. Enter `npx hardhat run scripts/deploy.ts` in terminal to deploy smart contract to `Goerli` testnet.

## `.env` file

1. `NODE_API_URL` - Alchemy node url

   - Register an account in [Alchemy](https://www.alchemy.com/) or login if you have existing account.
   - Create project as [shown in the video - Create an Alchemy Key](https://docs.alchemy.com/docs/alchemy-quickstart-guide#1key-create-an-alchemy-key) but select `Goerli` under Network tab.
   - Copy the url from `View Key` tab and paste to `NODE_API_URL` to `.env` file parameter. [eg: NODE_API_URL = "https://..."]

2. `WALLET_PRIVATE_KEY` - Private key of wallet
   - Follow [guide here](https://www.coindesk.com/learn/how-to-set-up-a-metamask-wallet/) to install Metamask on browser and create new wallet
   - Follow [link here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) to retrieve private key from Metamask and paste to `WALLET_PRIVATE_KEY` to `.env` file parameter.
