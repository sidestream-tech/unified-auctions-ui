import { HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import BigNumber from '../../src/bignumber';
import { warpTime, resetNetworkAndSetupWallet, addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat';
import { Simulation } from '../types';

const HARDHAT_FORK_BLOCK_NUMBER = 14955398;

const simulation: Simulation = {
    title: 'Fork block with liquidated vault 7370',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Block with liquidatable ETH-A vault with index 7370,
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
