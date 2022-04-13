# Chaos Simulation Reverse Proxy

The package to access chaoslabs simulations locally. Forked from the [ChaosLabsInc/chaos-server-proxy](https://github.com/ChaosLabsInc/chaos-server-proxy).

## Functionality

1. Spin up a remote in-the-cloud simulation based on given enviourment variables
2. Start a reverse proxy to the simulation RPC node and serve it on localhost

## Environment variables

- `CHAOSLABS_ACCESS_TOKEN`: (required) access topken (acquired from the chaoslabs)
- `CHAOSLABS_SIMULATION_IDS`: (required) a list of comma-separated `simulationIds` (acquired from the chaoslabs)
- `PORT`: (optional, default `8545`) a port on which the proxy will start
  create new project -> settings -> keys). Note: this project can not be restricted by the origin.

### How to start

1. Create `chaos-proxy/.env` file with required env variables (see above)
2. Install the dependecies with `npm i`
3. Run `npm run dev`
