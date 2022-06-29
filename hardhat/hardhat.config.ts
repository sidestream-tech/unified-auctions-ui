import dotenv from "dotenv";
import "@nomiclabs/hardhat-waffle";

dotenv.config();
const ALCHEMY_URL = process.env.ALCHEMY_URL;

if (!ALCHEMY_URL) {
  throw new Error(
    "ALCHEMY_URL env variable not set, please check your `hardhat/.env` file"
  );
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: ALCHEMY_URL,
        // Few blocks before WSTETH-A is taken at 14052147,
        // https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457a
        blockNumber: 14052140,
      },
    },
  },
};
