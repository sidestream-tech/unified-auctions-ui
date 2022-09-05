import { warpTime, resetBlockchainFork } from '../../helpers/hardhat';
export default {
    title: 'Fork block with active surplus auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Block with various states of surplus auctions at 14078339,
            entry: async () => {
                await resetBlockchainFork(14078339);
            },
        },
        {
            title: 'Skip time',
            entry: async () => await warpTime('custom'),
        },
    ],
};
