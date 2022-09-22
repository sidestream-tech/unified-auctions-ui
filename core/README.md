# Auctions Core

Set of typescript functions, tests and simulation to work with MakerDAO auctions.

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
3. Adding price oracle configurations for the token:
    1. Get the source code of the price oracle contract:
       - read value `ilks(collateralType)` from [`Spot` contract](https://etherscan.io/address/0x65c79fcb50ca1594b025960e539ed7a9a6d434a3#code) via "Read Contract" tabl - and receive the address of the oracle for the specified collateral. The linked conract is responsible for updating the unit prices for collaterals.
    2. Read the contract and determine the slot address of the variable:
       - Generally a slot number can be determined by counting definition of variables in the contract source code, but there are exceptions, [please read the docs on the solidity version the contract was compiled with](https://docs.soliditylang.org/en/v0.8.13/internals/layout_in_storage.html)
       - Experimenting with blockchain fork (e.g. hardhat) helps: try to fetch the value you're looking for / overwrite it / ... and validate that it's correct via some public method or comparing against your expectation. See section [Overwriting values of price oracles](./README.md#overwriting-values-of-price-oracles)
    3. Extend collateral config with the proper slot addresses.
    4. If needed, add the oracle type to `types` file if the existing types are not sufficient to cover for the set of values you need.
4. Run `npm run collateral:onboard` to run the script that helps to choose the oracle config.
    - when the script outputs the json with the config, add it to the `oracle` key of the collateral configuration in `COLLATERALS.ts`
    - if the script terminates with an error, please submit the report to the repository at https://github.com/sidestream-tech/unified-auctions-ui via an issue so that the support could be added.
    - Read more about the collateral oracle configurations at `./README.md#collateral-oracle-configs`

### Collateral oracle configs

Each collateral has the source where its price is fetched from. These values are stored on the blockchain, however they are not exposed via public access methods.
This forces the tool to use direct access to the contract's memory in order to fetch the price. Sadly, there is no 100% certain way to tell wether the fetched value is the
one that is being looked for. Therefore this functionality has to be configured direcly by the development team.

Configurations include the following information:

  - wether price oracle records the future price and waits for some time before updating the current price with the next one. This allows the keepers to have time to react to the market condition changes. For example, one is able to catch a moment and reduce the vault's debt and prevent it from being liquidated after the collateral price has gone down dramatically.
  - where in the memory the price (next or current) is stored. The contract's memory is split into "blocks" that are called _slots_.
  - Value offsets: since the slots are of fixed size (in Bytes), some variables that contract uses might occupy not all the provided by the slot memory. To be more efficient, solidity contracts can store
    several variables in the single slot. Therefore offsets are needed in some cases so that it is possible to tell where exactly to look for the variable value. In other words: slot number and offset in bytes specifies the variable location precisely.

As of the state of `mainnet` on block `15582667`: there're two possible configurations and therefore two possible ways to extract the collateral prices from the contract.
