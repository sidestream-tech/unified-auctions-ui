# Auction UI

The tool to enable easy and straightforward participation in [MakerDAO](https://makerdao.com/) liquidations for users both completely unfamiliar with Maker protocol but also experts.

### Development

#### Environment variables

-   `INFURA_PROJECT_ID`: (required) [infura](https://infura.io/) project id (can be found in: dashboard -> etherium -> create new project -> settings -> keys)
-   `DEMO_MODE`: (optional) When set to true the page will only show a "Coming soon" screen. Can be used for production while the page is not ready yet.
-   `PRODUCTION_DOMAIN`: (optional) Required in order to enable [plausible.io statistics](https://github.com/moritzsternemann/vue-plausible#configuration). In addition to adding it here, the domain (e.g. `auctions.makerdao.network`) should also be registered within [plausible dashboard](https://plausible.io/).

NOTE: Environment variables are accessible/available via the `secret` command. Please refer to the [secrets and configuration management guide](https://github.com/sidestream-tech/guides/tree/main/secrets) for more information:

#### Running

```sh
secret export auction-ui/dev --format dotenv > ./frontend/.env
cd ./frontend && npm ci && npm run dev
```

### Production/Deployment

#### Statistics

In order to properly collect statics using plausible.io, we ask developers and company members who need to interact with the production version of the website to opt out of plausible tracking using [those instructions](https://plausible.io/docs/excluding).
