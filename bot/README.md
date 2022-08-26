# Unified Auctions bot

## What is "Unified Auctions Bot"?

"Unified Auctions Bot" is a server-side application with two distinct functionalities:

-   `Twitter bot` – a script that periodically fetches collateral auctions and publish a tweet if it finds a new auction
-   `Keeper bot` – a script that periodically fetches collateral auctions and their market values, and if it finds that any
    of them are profitable, executes respective transactions (authorizations and bidding)

The bots can be hosted by any user, provided, they configure related environment variables. For more details, please
refer to [`Environment variables`](#environment-variables) section below.

## Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

## Environment variables

-   `RPC_URL`: (required) Etherium RPC url used for fetching data from the blockchain and participating in the auctions
-   `SUPPORTED_AUCTION_TYPES`: (optional, default `COLLATERAL, SURPLUS, DEBT`) a comma-separated list of auction types the bot will interact with
-   `WHITELISTED_COLLATERALS`: (optional) a comma-separated list of collaterals the bot will fetch. Example: `MATIC-A, UNI-A`
-   `MAX_PRIORITY_FEE_PER_GAS_WEI`: (optional, default can be found in core/src/gas.ts) – [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) `max_priority_fee_per_gas` value
-   `REFETCH_INTERVAL`: (optional, default 60 seconds) – interval between auction fetching requests
-   `KEEPER_*`: (optional) set of env variables to enable keeper bot:
    -   `KEEPER_WALLET_PRIVATE_KEY`: (required) The wallet private key (https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key)
    -   `KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI`: (required if `KEEPER_COLLATERAL` is set to `true`) The minimum net profit a collateral auction must yield before the keeper automatically bids on it. Can be negative if one is willing to spend ETH on transaction fees to keep DAI stable
    -   `KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI`: (required if `KEEPER_SURPLUS` is set to `true`) The minimum net profit a surplus auction must yield before the keeper automatically bids on it. Can be negative if one is willing to spend ETH on transaction fees to keep DAI stable
    -   `KEEPER_PREAUTHORIZE`: (optional, default `false`) if set to `true`, the wallet will execute all required authorizations (for DAI and collateralals) on start. Default behaviour is to wait until specific auction is profitable and then execute authorizations only required for the particular auction. Note that it's recommended to set this to `true` only in combination with `WHITELISTED_COLLATERALS`
-   `TWITTER_*`: (optional) set of env variables to enable twitter bot. Created via twitter developer account
    with `OAuth 1.0a` `Elevated` access and `Read and Write` permissions:
    -   `TWITTER_API_KEY`: (required)
    -   `TWITTER_API_SECRET`: (required)
    -   `TWITTER_ACCESS_TOKEN`: (required)
    -   `TWITTER_ACCESS_SECRET`: (required)
    -   `FRONTEND_ORIGIN`: (required) The auction UI origin for the tweet (valid
        example: `https://auctions.makerdao.network`)

Note: env variables are accessible via the `secret` command under `auction-ui/${environment}/bot`.

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md)
to get started with your development setup. Namely, you should:

-   have a minimum `node` and `npm` version (see `package.json` `engine` section)
-   have a certain formatting and linting setup
-   don't forget to create `./bot/.env` file

Help on both things is given in the linked resources above.

### Production Setup

Testing scenario:

1. Create `./bot/.env` file all variables from `auction-ui/bot/staging` or `auction-ui/bot/production`
2. Start the project in production mode, i.e.: `npm run build && npm start` or using docker image
3. Restart auction on kovan using frontend
4. Check the logs for the tweet message and its url

Using the `Dockerfile`:

Run the following commands:

```sh
# 1. Build the docker image
> docker build -t auction-ui-bot -f Dockerfile ..

# 2. Generate temporary AWS credentials
> aws-vault exec YOUR_AWS_ACCOUNT_NAME -- env  | grep AWS > .env

# 3. Start the bot
> docker run  --env-file .env auction-ui-bot
```
