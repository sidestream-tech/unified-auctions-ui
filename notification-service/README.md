# Unified Auctions Notification Service

## What is "Unified Auctions Notification Service?"?

"Unified Auctions Notification Service" is a server-side application with the purpose of updating users to a specific blockchain contract. Whenever a change is made to this contract the user will be informed via email or other methods. This is to ensure quick response times, when changes were made that could break our products.

The bots can be hosted by any user, provided, they configure related environment variables. For more details, please
refer to [`Environment variables`](#environment-variables) section below.

## Setup

```bash
# install dependencies
$ npm install

# serve with hot reload
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

## Environment variables


Note: env variables are accessible via the `secret` command under `auction-ui/notification-service/${environment}`.

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md)
to get started with your development setup. Namely, you should:

- have a minimum `node` and `npm` version (see `package.json` `engine` section)
- have a certain formatting and linting setup
- don't forget to create `./notification-service/.env` file

Help on both things is given in the linked resources above.
