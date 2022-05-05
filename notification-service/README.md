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
- `SMTP_*`: (optional, required for email usage) - SMTP data for the service to send emails
    - `SMTP_HOST`: (required) - SMTP host address
    - `SMTP_PORT`: (optional) - SMTP port. Defaults to `465`
    - `SMTP_USERNAME`: (required) - SMTP username
    - `SMTP_PASSWORD`: (required) - SMTP password
    - `SMTP_EMAIL`: (required) - The outgoing address which is displayed to the user
- `RECEIVERS`: (required) - a json-formatted object with `receiver` as key and `Event Subscription Ids` as an array value, eg `RECEIVERS="{\"email@example.com\": {\"type\": \"email\", \"subscriptions\": [\"EVENT_1\", \"EVENT_2\"]}}"`. The email will then become subscribed to the listed events

Note: env variables are accessible via the `secret` command under `auction-ui/${environment}/notification-service`.

## Adding a new "Receiver"
You can set your receivers over the environment variable `RECEIVERS`. This is a json-formatted object. An example can be found below:

```json
{
  "test@example.com": {
    "type": "email",
    "subscriptions": ["MCD_DAI_Transfer", "ChainLogUpdateAddress"]
  },
  "https://discord.com/api/webhooks/YOUR_WEBHOOK_ADDRESS": {
    "type": "discord",
    "subscriptions": ["MCD_DAI_Transfer", "ChainLogUpdateAddress"]
  }
}
```
_final environment variable must be [stringified JSON](https://onlinejsontools.com/stringify-json)!_

We currently support two different receiver types:

### Email
In order to use email receivers you need to set up your own SMTP server and connect it to the service. Refer to [`Environment variables`](#environment-variables) for more information.

When adding a new Email Receiver make sure to set the email address as the key of the object and set the type to `email`.

### Discord
If you want to send updates to your discord server, please begin by generating a [Discord Webhook URL](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks).

When adding a new discord receiver make sure to set the discord web hook url as the key of the object and set the type to `discord`.

## Adding a new "Event Subscription"

In order to add a custom event subscription you need to edit the file `/constants/SUBSCRIPTIONS.ts`. Inside you will
find an array of Event Subscriptions. You can add your own with the following format:

```js
export const SUBSCRIPTIONS: EventSubscription[] = [
  {
    id: 'ChainLogUpdateAddress',
    address: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
    eventName: 'UpdateAddress',
    formatData: (event, formatEtherscanLink) => {
      return `> From: [${event.args.src}](${formatEtherscanLink('address', event.args.src)})<br />
              > To: [${event.args.dst}](${formatEtherscanLink('address', event.args.src)})`;
    },
  }
]
```

- `id` - Unique identifier. Used for references in email and console logs
- `address` - The Ethereum address which expected to emit the event
- `eventName` - The name of the event you want to observe
- `formatData` - A function that takes the emitted event data and have to return a markdown string that will be displayed in through the different notifiers. It has two values provided to help with the formatting:
  - `event` - the entire data returned by the event being called
  - `formatEtherscanLink` - a helper function that takes in `type` (either `address` or `tx`) and the content (either the `address` or `transactionHash`).

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md)
to get started with your development setup. Namely, you should:

- have a minimum `node` and `npm` version (see `package.json` `engine` section)
- have a certain formatting and linting setup
- don't forget to create `./notification-service/.env` file

Help on both things is given in the linked resources above.
