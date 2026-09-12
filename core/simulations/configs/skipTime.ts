import { warpTime, createWalletForRpc } from '../../helpers/hardhat/network';
import { Simulation } from '../types';
import promptNumber from '../helpers/promptNumber';

const simulation: Simulation = {
    title: 'Skip time',
    steps: [
        {
            title: 'Skip time',
            entry: async () => {
                await createWalletForRpc();
                const blocks = await promptNumber({ title: 'Number of blocks to skip', min: 1, initial: 10 });
                const gapMinutes = await promptNumber({
                    title: 'Number of minutes between blocks',
                    min: 1,
                    initial: 6,
                });
                await warpTime(blocks, gapMinutes);
                return;
            },
        },
    ],
};
export default simulation;
