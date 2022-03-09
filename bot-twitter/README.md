# Unified Auctions bot

## What is "Unified Auctions Bot"?

Unified Auctions Bot" is a server-side application with two distinct functionalities:

- `Twitter bot` – a script that periodically fetches collateral auctions and publish a tweet if it finds a new auction
- `Keeper bot` – a script that periodically fetches collateral auctions and their market values, and if it finds that any
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

- `INFURA_PROJECT_ID`: (required) [infura](https://infura.io/) project id (can be found in: dashboard -> ethereum ->
  create new project -> settings -> keys). Note: this project can not be restricted by the origin.
- `ETHEREUM_NETWORK`: (optional, default `kovan`) – internal network name on which the bot poll for auctions. Available
  options can be found in [constants/NETWORKS](../core/src/constants/NETWORKS.ts)
- `REFETCH_INTERVAL`: (optional, default 60 seconds) – interval between auction fetching requests
- `FRONTEND_ORIGIN`: (required) An origin to which the bot will redirect users (valid
  example: `https://auctions.makerdao.network`)
- `KEEPER_*`: (optional) set of env variables to enable keeper bot:
    - `KEEPER_WALLET_PRIVATE_KEY`: (required) The wallet private key (https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key)
    - `KEEPER_MINIMUM_NET_PROFIT_DAI`: (required) The minimum amount of DAI an auction must yield (substracted the transaction fees) before the keeper automatically bids on it. Can be negative if one is willing to spend to keep
- `TWITTER_*`: (optional) set of env variables to enable twitter bot. Created via twitter developer account
  with `OAuth 1.0a` `Elevated` access and `Read and Write` permissions:
    - `TWITTER_API_KEY`: (required)
    - `TWITTER_API_SECRET`: (required)
    - `TWITTER_ACCESS_TOKEN`: (required)
    - `TWITTER_ACCESS_SECRET`: (required)

Note: env variables are accessible via the `secret` command under `auction-ui/bot/${environment}`.

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md)
to get started with your development setup. Namely, you should:

- have a minimum `node` and `npm` version (see `package.json` `engine` section)
- have a certain formatting and linting setup
- don't forget to create `./bot-twitter/.env` file

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
