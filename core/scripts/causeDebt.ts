import hre from 'hardhat';
import { causeDebt } from '../helpers/causeDebt';
import { HARDHAT_PRIVATE_KEY } from '../helpers/constants';
import { createWalletForRpc } from '../helpers/hardhat';

const provider = hre.network.provider;

(async () => {
    await createWalletForRpc(HARDHAT_PRIVATE_KEY, 'custom');
    await causeDebt('custom', provider);
})();
