# Hardhat simple testing environment

### Environment variables

- `ALCHEMY_URL`: (required) [alchemy](https://www.alchemy.com) endpoint url (can be found in: apps table -> app -> view key)
- `WALLET_PRIVATE_KEY`: (optional) – A private key of a wallet to which the money will be transferred on the test chain. If not present, a list of test accounts will be printed to the console upon starting the hardhat.

### Usage

1. Install dependencies via `npm ci`
2. Set environment variables into `hardhat/.env` file manually,
   or use `secret export --format=dotenv auction-ui/localhost/hardhat -o=.env` (if you have access to secrets)
3. Run mainnet fork via `npm run dev`
4. Start frontend and navigate to [/collateral?network=localhost](http://localhost:3000/collateral?network=localhost)
