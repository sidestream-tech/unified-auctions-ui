import { resetNetworkAndSetupWallet, warpTime } from '../../helpers/hardhat/network';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { Simulation } from '../types';

const HARDHAT_FORK_BLOCK_NUMBER = 14078339;

const simulation: Simulation = {
    title: 'Fork block with active surplus auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Block with various states of surplus auctions at 14078339,
            entry: async () => {
                await resetNetworkAndSetupWallet(HARDHAT_FORK_BLOCK_NUMBER);
            },
        },
        {
            title: 'Add DAI and MKR to the wallet',
            entry: async () => {
                await addDaiToBalance();
                await addMkrToBalance();
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
