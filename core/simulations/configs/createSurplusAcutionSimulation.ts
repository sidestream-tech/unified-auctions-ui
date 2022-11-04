import { resetNetworkAndSetupWallet, warpTime } from '../../helpers/hardhat/network';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';

import { causeSurplus } from '../../helpers/auctionSimulators';
import { Simulation } from '../types';

const simulation: Simulation = {
    title: 'Create surplus auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                await resetNetworkAndSetupWallet(undefined);
            },
        },
        {
            title: 'Create surplus auction',
            entry: async () => {
                await causeSurplus();
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
                await warpTime(60, 60);
                return;
            },
        },
    ],
};
export default simulation;
