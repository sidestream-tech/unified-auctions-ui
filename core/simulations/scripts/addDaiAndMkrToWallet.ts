import { HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import { addToBalance } from '../../helpers/hardhat';
import BigNumber from '../../src/bignumber';

export default async (mkr: BigNumber = new BigNumber(1000), dai: BigNumber = new BigNumber(1000)) => {
    await addToBalance('custom', HARDHAT_PUBLIC_KEY, mkr, dai);
};
