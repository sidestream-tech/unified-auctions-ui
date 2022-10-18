import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat';
import { Simulation } from '../types';

const simulation: Simulation = {
    title: 'Fork block with active WSTETH-A auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Few blocks before WSTETH-A is taken at 14052147,
            // https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457at
            entry: async () => {
                await resetNetworkAndSetupWallet(14052140);
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
