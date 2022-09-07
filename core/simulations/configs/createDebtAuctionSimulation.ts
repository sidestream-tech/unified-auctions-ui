import { HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import BigNumber from '../../src/bignumber';
import { resetNetworkAndSetupWallet, warpTime, addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat';
import { causeDebt } from '../../helpers/auctionSimulators';
import { Simulation } from '../types';

const simulation: Simulation = {
    title: 'Create debt auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                await resetNetworkAndSetupWallet(undefined);
            },
        },
        {
            title: 'Create debt auction',
            entry: async () => {
                await causeDebt();
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
