import { resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';
import { Simulation } from '../types';

const simulation: Simulation = {
    title: 'Fork blocks with vaults in various states',
    steps: [
        {
            title: 'Reset blockchain fork to block with non-liquidatable ETH-A vault 22025',
            entry: async () => {
                await resetNetworkAndSetupWallet(15502000);
            },
        },
        {
            title: 'Reset blockchain fork to block with liquidatable ETH-C vault 27435',
            entry: async () => {
                await resetNetworkAndSetupWallet(14955381);
            },
        },
        {
            title: 'Reset blockchain fork to block with liquidated ETH-A vault 7370',
            entry: async () => {
                await resetNetworkAndSetupWallet(14955398);
            },
        },
    ],
};
export default simulation;
