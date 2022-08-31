import { HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import { addDaiToBalance, addMkrToBalance } from '../../helpers/hardhat';
import BigNumber from '../../src/bignumber';

export default async (mkr: BigNumber = new BigNumber(1000), dai: BigNumber = new BigNumber(1000)) => {
    await addDaiToBalance('custom', HARDHAT_PUBLIC_KEY, dai);
    await addMkrToBalance('custom', HARDHAT_PUBLIC_KEY, mkr);
};
