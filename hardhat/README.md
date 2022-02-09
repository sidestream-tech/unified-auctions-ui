# Hardhat simple testing environment

### Environment variables

- `ALCHEMY_URL`: (required) [alchemy](https://www.alchemy.com) endpoint url (can be found in: apps table -> app -> view key)

### Usage

1. Install dependencies via `npm ci`
2. Set environment variables into `hardhat/.env` file manually, or use `secret export --format=dotenv auction-ui/localhost/hardhat -o=.env` (if you have access to secrets)
3. Run mainnet fork via `npm run dev`
4. Start frontend and navigate to [/collateral?network=localhost](http://localhost:3000/collateral?network=localhost)

Note: in order to get some tokens for transaction fees, you can add one of the accounts populated by the hardhat to your Metamask extension:

- Copy private key from the `hardhat` terminal (it prints 10 of them when it starts)
- Open Metamask extension
- Click on the Metamask account icon
- Select `Import Account`
- Paste the key into the input, click `Import` button
- Select new account, while being connected to the frontend
- Done, now you can execute transactions

Note: _be careful, never mix up testing metamask profile with the accounts that holds actual tokens_.

### Troubleshooting

#### `Nonce too high` error

This Metamask error happens every time you restart hardhat after executing a transaction(s). To resolve:

- Open Metamask extension
- Click on the Metamask account icon
- Select `Settings`
- Select `Advanced`
- Click red `Reset Account` button, confirm
