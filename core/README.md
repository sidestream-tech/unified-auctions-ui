# Auctions Core

Set of typescript functions, tests and simulation to work with MakerDAO auctions.

## Collateral price extraction

The functionality of the tool includes fetching collateral prices from the blockchain in order to determine wether the vault is or will be undercollateralized.
The price is fetched from the private variables of the contract. Since the variables are private, they are only accessible via memory address. Different contracts have different memory layouts.
On top of that the information that is contained in the contracts differs - e.g. some of them do not contain future prices.
Therefore it is necessary to specify the memory addresses for each collateral type since there's one price source (contract) per collateral. The fetching is done based on the provided values.

## Simulations

In order to run create specific situations relevant to the Maker auctions:
1. Create `core/.env` file with required env variables (see the list below)
2. Start RPC node and the simulation via a single command `npm run simulate`
3. Select desired simulation from the list
4. Connect to the created RPC endpoint using `frontend` or the `bot`

## Environment Variables

- `REMOTE_RPC_URL`: (required for tests, simulations) Ethereum RPC url _with access to historical data_. Used by hardhat to fetch relevant block data
- `LOCAL_RPC_URL`: (optional, default `http://localhost:8545`) Hardhat RPC url. Used by tests and simulations

## Collateral onboarding

The process of adding new collaterals depends on the token type used. This is due collateral token address as well as related contract addresses (such as clip and calc) are always up to date, as our library fetches current contract addresses from the [chainlog](https://chainlog.makerdao.com) contract.

1. Adding standard ERC-20 collateral is straightforward and consists of only one step.

   1. Add collateral configuration to the [`COLLATERALS.ts`](./src/constants/COLLATERALS.ts)

2. Adding other types of tokens (which require separate `callee` contract):

    1. Determine the name of the new callee, eg `UniswapV2CalleeDai`
    2. Extend `CalleeAddresses` type in the [`types.ts`](./src/types.ts) using the name from `1.`
    3. Add addresses of the callee for all supported networks in [`CALLEES.ts`](./src/constants/CALLEES.ts)
    4. Add collateral configuration to the [`COLLATERALS.ts`](./src/constants/COLLATERALS.ts)
    5. Add new exchange file to the [`calleeFunctions` folder](./src/calleeFunctions)
        - The file should be named using the name from `1.`
        - The file should export `CalleeFunctions`
        - The file should be imported in the [`calleeFunctions/index.ts`](./src/calleeFunctions/index.ts)
