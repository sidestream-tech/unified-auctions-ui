# Auctions Core

Set of typescript functions, tests and simulation to work with MakerDAO auctions.

## Development setup

In order to run simulations and create specific blockchain state, relevant to the Maker auctions:
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
    6. Import exchange file inside [`calleeFunctions/index.ts`](./src/calleeFunctions/index.ts) and export under `allCalleeFunctions`

3. Adding price oracle configurations for the new collateral type:

    1. Get the source code of the price oracle contract. Read value `ilks(collateralType)` from the [`MCD_SPOT` contract](https://etherscan.io/address/0x65c79fcb50ca1594b025960e539ed7a9a6d434a3#code) via "Read Contract" tab and get the address of the oracle for the specified collateral. The linked conract is responsible for updating the unit prices for collaterals
    2. If the contract resembles OSM ([Oracle Security Module](https://github.com/makerdao/osm)) `ORACLE_WITH_DELAY` needs to be used, otherwise `ORACLE_WITHOUT_DELAY`

### Onboarding not yet deployed collateral

When a completely new collateral type support is being prepared, we need to ensure that it will work even before the Maker Protocol is changed via a [`spell`](https://docs.makerdao.com/smart-contract-modules/governance-module/spell-detailed-documentation). Usually a new spell is prepared in the [spells-mainnet](https://github.com/makerdao/spells-mainnet/pulls) repository. When it is there we need to fork the repository, compile the spell and deploy it into the hardhat fork. Currently the setup is as follows:

1. `rsync` or clone the repo to the desired x86 machine (tested with Docker 19.03.12 on Ubuntu 20.04)
2. `cd` into the `core/simulations/docker` and run `docker-compose up` to start the hardhat fork in one container and another container with installed [`dapp-tools`](https://github.com/dapphub/dapptools)
3. Shell into the `spells` container
    - List avialble containers `docker container ls` (copy `CONTAINER ID` of the `docker_spells`)
    - Shell into the container `docker exec -it 277a8d793341 sh`
4. Fix future `Invalid argument` `nix` error via `echo 'filter-syscalls = false' >> /etc/nix/nix.conf`
5. Open `nix` shell with useful tools `nix-shell -p cacert cachix curl git jq nix gnumake nano`
6. Update `dapp --version` to the supported version (currently 0.35.0)
    - Install `duppgrade` via `curl https://rari-capital.github.io/duppgrade/install | bash`
    - Execute `duppgrade` and wait
7. Clone branch containing the spell
    - Clone the repo, eg `git clone https://github.com/makerdao/spells-mainnet spells && cd spells`
    - Checkout correct branch `git checkout CES-795`
8. Fetch all libraries (that are linked via git submodules) using `dapp update`
9. Create keystore (that will be used by dapp-tools)
    - Set hardhat private key into the file `echo 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' > ../private-key`
    - Set password `echo '' > ../key-password`
    - Import key to create a keystore folder `(printf "\n\n" && cat) | geth account import --datadir /root ../private-key`
    - Press enter to finish the process
10. Prepare env vars
    - `export ETH_KEYSTORE="/root/keystore"`
    - `export ETH_PASSWORD="/root/key-password"`
    - `export ETH_RPC_URL=http://core:8545`
    - `export ETH_FROM="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"` - the address of the key from above
    - `export ETH_GAS=3000000` - might need to be adjusted based on the `make estimate` output
    - `export ETH_GAS_PRICE=1000000000000`
11. Compile the spell via `make`
12. Deploy the spell via `dapp create DssSpell`
13. Copy the bitecode of the spell into the `core/bytecode/compiledSpells.json` file, which will automatically update the `Onboard new collateral` simulation
14. Run `Onboard new collateral` locally to deploy compiled bytecode and execute the spell, create vault, liquidate vault to create auction
15. Run keeper and frontend against the simulation to validate that it worked

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
