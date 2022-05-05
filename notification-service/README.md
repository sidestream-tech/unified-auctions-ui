# Unified Auctions Notification Service

## What is "Unified Auctions Notification Service?"?

"Unified Auctions Notification Service" is a server-side application with the purpose of updating users to a specific
blockchain contract. Whenever a change is made to this contract the user will be informed via email or other methods.
This is to ensure quick response times, when changes were made that could break our products.

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

- `INFURA_PROJECT_ID`: (required) [infura](https://infura.io/) project id (can be found in: dashboard -> ethereum ->
- `ETHERSCAN_API_KEY`: (required) [Etherscan API Key](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics), which is used to automatically download ABIs 
- `ETHEREUM_NETWORK`: (optional, default `kovan`) – internal network name on which the bot poll for auctions. Available
- `SMTP_*`: (required) - SMTP data for the service to send emails
    - `SMTP_HOST`: (required) - SMTP host address
    - `SMTP_PORT`: (optional) - SMTP port. Defaults to `465`
    - `SMTP_USERNAME`: (required) - SMTP username
    - `SMTP_PASSWORD`: (required) - SMTP password
    - `SMTP_EMAIL`: (required) - The outgoing address which is displayed to the user
- `RECEIVERS`: (required) - a json-formatted object with `email` as key and `Event Subscription Ids` as an array value, eg `RECEIVERS="{\"email@example.com\": [\"EVENT_1\", \"EVENT_2\"]}"`. The email will then become subscribed to the listed events

Note: env variables are accessible via the `secret` command under `auction-ui/notification-service/${environment}`.

## Adding a new "Event Subscription"

In order to add a custom event subscription you need to edit the file `/constants/SUBSCRIPTIONS.ts`. Inside you will
find an array of Event Subscriptions. You can add your own with the following format:

```js
export const SUBSCRIPTIONS: EventSubscription[] = [
  {
    id: 'ChainlogUpdateVersion',
    address: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
    eventName: 'UpdateVersion',
    formatData: (event, formatEtherscanLink) => {
      return `Key: ${event.args.key}<br /> Address: <a href="${formatEtherscanLink('address', event.args.addr)}">${event.args.addr}</a>`;
    },
  }
]
```

- `id` - Unique identifier. Used for references in email and console logs
- `address` - The Ethereum address which expected to emit the event
- `eventName` - The name of the event you want to observe
- `formatData` - A function that takes the emitted event data and have to return a html string that will be displayed in the email. It has two values provided to help with the formatting:
  - `event` - the entire data returned by the event being called
  - `formatEtherscanLink` - a helper function that takes in `type` (either `address` or `tx`) and the content (either the `address` or `transactionHash`).

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md)
to get started with your development setup. Namely, you should:

- have a minimum `node` and `npm` version (see `package.json` `engine` section)
- have a certain formatting and linting setup
- don't forget to create `./notification-service/.env` file

Help on both things is given in the linked resources above.
