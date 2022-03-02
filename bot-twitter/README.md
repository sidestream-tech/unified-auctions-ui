# Auctions twitter bot

## What is our "Unified Auctions Bot"?
Our "Unified Auctions Bot", is a server side application, with a collection of tools 
for interacting with the blockchain and participating in MakerDAO collateral Auctions. 
The bot can be hosted by any user, provided, they configure the bot properly over the environment variables.

The bot currently has two main features. The first is the ability to tweet about new auctions, quickly alerting
users about new auctions. We are hosting our own version of this Twitter Bot. You can find its account [here](https://twitter.com/MakerDaiBot).

The second feature is the "Keeper". This is an automated system for bidding on certain auctions. Through configuration in the environment variables, you can 
provide a wallet secret key as well as a minimum profitability (in DAI). Once this profitability threshold is reached
the bot will automatically bid on the Auction for you.

In order to use the bot please fill out all required [environment variables](#environment-variables) below. You can skip all optional variables, or those
that are not required for the feature you want to use. Afterwards follow our Setup guides.

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

In order to configure you bot, you must create a `.env` file in the root of `/bot-twitter`.
Below you can find a list of all available environment variables, along with an explanation of 
what each variable determines. If not all parts of the bot are needed, you can leave some variables undefined.

- `INFURA_PROJECT_ID`: (required) [infura](https://infura.io/) project id (can be found in: dashboard -> ethereum -> create new project -> settings -> keys). Note: this project can not be restricted by the origin.
- `ETHEREUM_NETWORK`: (optional, default `kovan`) – internal network name on which the bot poll for auctions. Available options can be found in [constants/NETWORKS](../core/src/constants/NETWORKS.ts)
- `REFETCH_INTERVAL`: (optional, default 60 seconds) – interval between auction fetching requests
- `FRONTEND_ORIGIN`: (required) An origin to which the bot will redirect users (valid example: `https://auctions.makerdao.network`)
- `KEEPER_*` variables - a set of set for the keeper
    - `KEEPER_WALLET_PRIVATE_KEY`: (required for server side execution) The secret key of the wallet (https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key)
    - `KEEPER_MIN_PROFIT_DAI`: (required for keeper) The minimum amount of profit an auction must yield before the keeper automatically bids on it
- `TWITTER_*`: variables (optional for dev environment) – a set of secrets from twitter developer account with `OAuth 1.0a` `Elevated` access and `Read and Write` permissions:
    - `TWITTER_API_KEY`: (required)
    - `TWITTER_API_SECRET`: (required)
    - `TWITTER_ACCESS_TOKEN`: (required)
    - `TWITTER_ACCESS_SECRET`: (required)

Note: env variables are accessible via the `secret` command under `auction-ui/bot/${environment}`.

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md) to get started with your development setup. Namely, you should:

-   have a minimum `node` and `npm` version (see `package.json` `engine` section)
-   have a certain formatting and linting setup
-   don't forget to create `./bot-twitter/.env` file

Help on both things is given in the linked resources above.

### Production Setup

Testing scenario:

1. Create `./bot-twitter/.env` file all variables from `auction-ui/bot/staging` or `auction-ui/bot/production`
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
