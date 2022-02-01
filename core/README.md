# Auctions Core

Set of typescript functions to work with MakerDAO auctions.

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
