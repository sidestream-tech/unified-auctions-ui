import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import promptToGetNumber from '../helpers/promptToGetNumber';
import { Simulation } from '../types';
import hre from 'hardhat';

const simulation: Simulation = {
    title: `Fork at specific block`,
    steps: [
        {
            title: `Reset blockchain fork`,
            entry: async () => {
                const latestBlock = await hre.ethers.provider.getBlockNumber();
                const selectedBlockNumber = await promptToGetNumber(
                    'Block number to fork from',
                    latestBlock,
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
