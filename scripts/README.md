# Invoice Factoring MVP - Scripts

## Description

Scripts are the backend services that will be run periodically to retrieve pending factoring invoices and tokenize them into NFT that will then be sold in secondary marketplace to increase liquidity.

## Objective

- Upload file to IPFS via Filebase S3 API

## Get started

1. Make sure [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is installed.
2. Git clone the repository to local machine.
3. Make sure [yarn](https://yarnpkg.com/getting-started/migration#why-should-you-migrate) is installed.
4. Enter `yarn install` in terminal to install all required dependencies.
5. Make sure [api-server](../api-server/) is running at the background.

> Execute create dummy invoices script command in terminal : `yarn dev generate-dummy-invoice.ts`

> Execute mint NFT script command in terminal : `yarn dev mint-nft.ts`
