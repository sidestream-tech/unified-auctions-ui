import { HARDHAT_PRIVATE_KEY, HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import { resetBlockchainFork } from '../../helpers/hardhat';

export default async (block: number | undefined = undefined) => {
    console.info(`Wallet Credentials: public key: ${HARDHAT_PUBLIC_KEY}, private key: ${HARDHAT_PRIVATE_KEY}`);
    await resetBlockchainFork(block, HARDHAT_PRIVATE_KEY);
};
