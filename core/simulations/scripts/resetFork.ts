import { HARDHAT_PRIVATE_KEY } from '../../helpers/constants';
import { resetBlockchainFork } from '../../helpers/hardhat';

export default async (block: number | undefined = undefined) => {
    await resetBlockchainFork(block, HARDHAT_PRIVATE_KEY);
};
