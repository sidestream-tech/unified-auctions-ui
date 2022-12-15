import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import promptToGetNumber from '../helpers/promptToGetNumber';
import { Simulation } from '../types';
import hre from 'hardhat';

// Few blocks before WSTETH-A is taken at 14052147,
// https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457at
const DEFAULT_BLOCK_NUMBER = 14052140;

const simulation: Simulation = {
    title: `Fork at specific block`,
    steps: [
        {
            title: `Reset blockchain fork`,
            entry: async () => {
                const latestBlock = await hre.ethers.provider.getBlockNumber();
                const selectedBlockNumber = await promptToGetNumber(
                    'Block number to fork from',
                    DEFAULT_BLOCK_NUMBER,
                    latestBlock
                );
                await resetNetworkAndSetupWallet(selectedBlockNumber);
            },
        },
        {
            title: 'Skip time',
            entry: async () => {
                await warpTime();
                return;
            },
        },
    ],
};

export default simulation;
