# Auction UI

The tool to enable easy and straightforward participation in [MakerDAO](https://makerdao.com/) liquidations for users both completely unfamiliar with Maker protocol but also experts.

### Development

#### Environment variables

-   `INFURA_PROJECT_ID`: (required) [infura](https://infura.io/) project id (can be found in: dashboard -> etherium -> create new project -> settings -> keys)

NOTE: Environment variables are accessible/available via the `secret` command. Please refer to the [secrets and configuration management guide](https://github.com/sidestream-tech/guides/tree/main/secrets) for more information:

#### Running

```sh
secret export auction-ui/dev --format dotenv > ./frontend/.env
cd ./frontend && npm ci && npm run dev
```
