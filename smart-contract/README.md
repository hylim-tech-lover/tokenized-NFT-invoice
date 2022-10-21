# Invoice Factoring MVP - Smart Contract

## Description

Smart contract is a self-executing contract written into lines of code that automate workflow, triggering the next action when conditions are met. The code and the agreements contained therein exist across a distributed, decentralized blockchain network. The code controls the execution, and transactions are trackable and irreversible

Smart contracts permit trusted transactions and agreements to be carried out among disparate, anonymous parties without the need for a central authority, legal system, or external enforcement mechanism.

Implement basic ERC721 standard function based on OpenZeppelin.

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
