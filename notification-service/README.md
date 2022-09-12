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

# rebuild and launch server
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

## Environment variables

Note: env variables are accessible via the `secret` command under `auction-ui/${environment}/notification-service`.

- `INFURA_PROJECT_ID`: (required) [infura](https://infura.io/) project id (can be found in: dashboard -> ethereum ->
- `ETHERSCAN_API_KEY`: (required) [Etherscan API Key](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics), which is used to automatically download ABIs 
- `ETHEREUM_NETWORK`: (optional, default `mainnet`) – internal network name on which the bot poll for auctions. Available
- `SMTP_*`: (optional, required for email usage) - SMTP data for the service to send emails
    - `SMTP_HOST`: (required) - SMTP host address
    - `SMTP_PORT`: (optional) - SMTP port. Defaults to `465`
    - `SMTP_USERNAME`: (required) - SMTP username
    - `SMTP_PASSWORD`: (required) - SMTP password
    - `SMTP_EMAIL`: (required) - The outgoing address which is displayed to the user
- `RECEIVERS`: (required) - a [json-string-formatted](https://onlinejsontools.com/stringify-json) array of `Receivers` (See explanation below)
- `POWERED_BY`: (optional) - the operator of the service
- `POWERED_BY_LINK`: (optional) - a link on which you can contact the operator of the service

### Receivers:

Every Receiver requires the following values:
- `receiver` - A custom value depending on the notifier type (see examples below)
- `type` - The type of notifier (we currently support `email` and `discord`)
- `subscriptions` - An array of [Subscription Ids](#event-subscriptions)

You can find examples below:

#### Email Receiver:
```json
{
  "receiver": "test@example.com",
  "type": "email",
  "subscriptions": ["MCD_DAI_Transfer", "ChainLogUpdateAddress"]
}
```
Please make sure to include the required [`Environment variables`](#environment-variables).

#### Discord Receiver:
````json
{
  "receiver": "https://discord.com/api/webhooks/YOUR_WEBHOOK_ADDRESS",
  "type": "discord",
  "subscriptions": ["MCD_DAI_Transfer", "ChainLogUpdateAddress"]
}
````
Please provide a [Discord Webhook URL](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) to which we can send updates.

You do not need to update any other environment variables to setup a discord notifier.

## Event Subscriptions

Users can add their own custom event subscriptions. By default, the project comes with a few predefined subscriptions, however these may need to change depending on the use case or network.

The subscriptions can be found in `./src/constants/SUBSCRIPTIONS.ts`.

Every subscription requires the following values:
- `id` - Unique identifier. Used for references in email and console logs
- `address` - The Ethereum address which expected to emit the event
- `eventName` - The name of the event you want to observe
- `formatData` - A function that takes the emitted event data and have to return a markdown string that will be displayed in through the different notifiers. It has two values provided to help with the formatting:
  - `event` - the entire data returned by the event being called
  - `formatEtherscanLink` - a helper function that takes in `type` (either `address` or `tx`) and the content (either the `address` or `transactionHash`).

Example:
```js
export const SUBSCRIPTIONS: EventSubscription[] = [
  {
    id: 'ChainLogUpdateAddress',
    address: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
    eventName: 'UpdateAddress',
    formatData: (event, formatEtherscanLink) => {
      return `> From: [${event.args.src}](${formatEtherscanLink('address', event.args.src)})<br />
              > To: [${event.args.dst}](${formatEtherscanLink('address', event.args.src)})`;
    }
  }
]
```

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md)
to get started with your development setup. Namely, you should:

- have a minimum `node` and `npm` version (see `package.json` `engine` section)
- have a certain formatting and linting setup
- don't forget to create `./notification-service/.env` file

Help on both things is given in the linked resources above.
