# Auction UI Frontend

## Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate

# for component development
$ npm run storybook

# to run jest tests
$ npm run test
```

## Development Setup

Please see [this centralized guide](https://github.com/sidestream-tech/guides/blob/main/frontend-development/README.md) to get started with your development setup. Namely, you should:

-   have a minimum `node` and `npm` version (see `package.json` `engine` section)
-   have a certain formatting and linting setup

Help on both things is given in the linked resources above.

### Environment variables

- `INFURA_PROJECT_ID`: (required) [infura](https://infura.io/) project id (can be found in: dashboard -> etherium -> create new project -> settings -> keys)
- `DEMO_MODE`: (optional) When set to true the page will only show a "Coming soon" screen. Can be used for production while the page is not ready yet.
- `PRODUCTION_DOMAIN`: (optional) Required in order to enable [plausible.io statistics](https://github.com/moritzsternemann/vue-plausible#configuration). In addition to adding it here, the domain (e.g. `auctions.makerdao.network`) should also be registered within [plausible dashboard](https://plausible.io/).
- `CONTACT_EMAIL`: (optional) Required in order to display contact link in the footer. This email should be able to accept and manage bug reports and other contact requests.
- `STAGING_BANNER_URL`: (optional) When set a banner will be displayed, warning the user that they are using a staging version. It will also link to the actual UI.
