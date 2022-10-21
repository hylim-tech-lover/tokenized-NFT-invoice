# Invoice Factoring MVP - API Server

## Description

API Server is the "service provider" that performs certain actions on RESTful API request and will return JSON response regardless success or fail.

It is used to abstract underlying infrastructure communication from client and acts as their intermediary with dedicated endpoints.

## Objective

- Code refactoring for backend and frontend services using same API services
- Standardize response packet format for both backend and frontend services

## Get started

1. Make sure [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is installed.
2. Git clone the repository to local machine.
3. Make sure [yarn](https://yarnpkg.com/getting-started/migration#why-should-you-migrate) is installed.
4. Enter `yarn install` in terminal to install all required dependencies.

> Run unit test on API endpoint : `yarn test`

> Run API server in development mode: `yarn dev`

> Run API server in production mode: `yarn start`
