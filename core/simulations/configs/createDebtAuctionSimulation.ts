import { HARDHAT_PUBLIC_KEY, HARDHAT_PRIVATE_KEY } from '../../helpers/constants';
import BigNumber from '../../src/bignumber';
import { resetBlockchainFork, warpTime, addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat';
import { causeDebt } from '../../helpers/causeDebt';
import hre from 'hardhat';

const provider = hre.network.provider;

export default {
    title: 'Create debt auction',
    steps: [
        {
            title: 'Reset blockchain fork',
            entry: async () => {
                console.info(
                    `Wallet Credentials: public key: ${HARDHAT_PUBLIC_KEY}, private key: ${HARDHAT_PRIVATE_KEY}`
                );
                await resetBlockchainFork(undefined);
            },
        },
        {
            title: 'Create debt auction',
            entry: async () => {
                await causeDebt('custom', provider);
            },
        },
        {
            title: 'Add DAI and MKR to the wallet',
            entry: async () => {
                await addDaiToBalance('custom', HARDHAT_PUBLIC_KEY, new BigNumber(1000));
                await addMkrToBalance('custom', HARDHAT_PUBLIC_KEY, new BigNumber(1000));
            },
        },
        {
            title: 'Skip time',
            entry: async () => await warpTime('custom'),
        },
    ],
};
