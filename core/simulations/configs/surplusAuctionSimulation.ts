import { warpTime, resetBlockchainFork } from '../../helpers/hardhat';
import { HARDHAT_PRIVATE_KEY, HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
export default {
    title: 'Fork block with active surplus auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Block with various states of surplus auctions at 14078339,
            entry: async () => {
                console.info(
                    `Wallet Credentials: public key: ${HARDHAT_PUBLIC_KEY}, private key: ${HARDHAT_PRIVATE_KEY}`
                );
                await resetBlockchainFork(14078339);
            },
        },
        {
            title: 'Skip time',
            entry: async () => await warpTime('custom'),
        },
    ],
};
