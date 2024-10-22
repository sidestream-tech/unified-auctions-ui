import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat/balance';
import { warpTime, resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { promptToGetBlockNumber } from '../helpers/promptToGetNumber';
import { Simulation } from '../types';

const simulation: Simulation = {
    title: `Fork at specific block`,
    steps: [
        {
            title: `Reset blockchain fork`,
            entry: async () => {
                const selectedBlockNumber = await promptToGetBlockNumber();
                await resetNetworkAndSetupWallet(selectedBlockNumber);
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
