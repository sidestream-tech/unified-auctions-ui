# Unified Auctions Scripts

## What is "Unified Auctions Scripts"?

"Unified Auctions Scripts" is a collection of scripts we use to analyze the performance of our services on the blockchain.

We currently offer the ability to export the data of recent auctions. The collected data will show which collaterals are used most as well as if the auction was taken with one of our services.

## Setup

```bash
# install dependencies
$ npm install

# rebuild and launch server
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

## Environment variables

Note: env variables are accessible via the `secret` command under `auction-ui/${environment}/scripts`.

- `RPC_URL`: (required) Ethereum RPC url used for fetching data from the blockchain and participating in the auctions
- `DEBUG_MODE`: (optional) By default all error messages will be collected and exported after the collection. By turning on debug mode, error messages will be displayed in the console, during the execution.

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md)
to get started with your development setup. Namely, you should:

- have a minimum `node` and `npm` version (see `package.json` `engine` section)
- have a certain formatting and linting setup
- don't forget to create `./scripts/.env` file

Help on both things is given in the linked resources above.
