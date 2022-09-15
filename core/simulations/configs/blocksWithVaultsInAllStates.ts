import { resetNetworkAndSetupWallet } from '../../helpers/hardhat';
import { Simulation } from '../types';

const HARDHAT_FORK_BLOCK_NUMBER = 15502000;

const simulation: Simulation = {
    title: 'Fork blocks with vaults in various states',
    steps: [
        {
            title: 'Reset blockchain fork to block with non-liquidatable ETH-A vault 22025',
            entry: async () => {
                await resetNetworkAndSetupWallet(HARDHAT_FORK_BLOCK_NUMBER);
            },
        },
        {
            title: 'Reset blockchain fork to block with liquidatable ETH-C vault 27435',
            entry: async () => {
                await resetNetworkAndSetupWallet(HARDHAT_FORK_BLOCK_NUMBER);
            },
        },
        {
            title: 'Reset blockchain fork to block with liquidated ETH-A vault 7370',
            entry: async () => {
                await resetNetworkAndSetupWallet(HARDHAT_FORK_BLOCK_NUMBER);
            },
        },
    ],
};
export default simulation;
