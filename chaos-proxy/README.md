# Chaos Simulation Reverse Proxy

The package to access chaoslabs simulations locally. Forked from the [ChaosLabsInc/chaos-server-proxy](https://github.com/ChaosLabsInc/chaos-server-proxy).

## Functionality

1. Spin up a remote in-the-cloud simulation based on given enviourment variables
2. Start a reverse proxy to the simulation RPC node and serve it on localhost

## Environment variables

- `CHAOSLABS_ACCESS_TOKEN`: (required) access token (acquired from the chaoslabs)
- `CHAOSLABS_SIMULATIONS`: (required) a json-formatted object with `simulationId` as keys and free text as values, eg `CHAOSLABS_SIMULATIONS="{\"simulation-id-123\": \"100 ETH auctions\"}`. The text is used to not forget what each simulation does (`simulationId`s are acquired from the chaoslabs)
- `PORT`: (optional, default `8545`) a port on which the proxy will start
  create new project -> settings -> keys). Note: this project can not be restricted by the origin.

### How to start

1. Create `chaos-proxy/.env` file with required env variables (see explanation above)
    - If you have access to the chamber secrets, you can instead execute this command inside this folder:
    ```
    secret export auction-ui/localhost/chaos-proxy --format dotenv > ./.env
    ```
2. Install dependecies with `npm i`
3. Run `npm run dev`
