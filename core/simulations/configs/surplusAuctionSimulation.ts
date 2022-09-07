import { HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import BigNumber from '../../src/bignumber';
import { warpTime, resetNetworkAndSetupWallet, addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat';
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
                await addDaiToBalance(new BigNumber(100000), HARDHAT_PUBLIC_KEY);
                await addMkrToBalance(new BigNumber(100000), HARDHAT_PUBLIC_KEY);
            },
        },
        {
            title: 'Skip time',
            entry: async () => await warpTime(),
        },
    ],
};
export default simulation;
