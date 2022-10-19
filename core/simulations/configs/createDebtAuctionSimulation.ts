import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { resetNetworkAndSetupWallet, warpTime } from '../../helpers/hardhat/network';
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
