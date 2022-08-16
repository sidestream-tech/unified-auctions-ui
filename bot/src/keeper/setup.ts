import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import { KEEPER_MINIMUM_NET_PROFIT_DAI, KEEPER_WALLET_PRIVATE_KEY } from '../variables';

export const isSetupCompleted = (isSetupCompleted: boolean = false): boolean => {
    return isSetupCompleted;
};

export const setupKeeper = async function (network: string) {
    if (!KEEPER_WALLET_PRIVATE_KEY) {
        console.warn('keeper: KEEPER_WALLET_PRIVATE_KEY variable is not set, keeper will not run');
        return;
    }
    if (Number.isNaN(KEEPER_MINIMUM_NET_PROFIT_DAI)) {
        console.warn('keeper: KEEPER_MINIMUM_NET_PROFIT_DAI is not set or not a number, keeper will not run');
        return;
    }
    try {
        setSigner(network, createSigner(network, KEEPER_WALLET_PRIVATE_KEY));
        const signer = await getSigner(network);
        const address = await signer.getAddress();
        isSetupCompleted(true);
        console.info(
            `keeper: setup complete: using wallet "${address}", looking for minimum clear profit of "${KEEPER_MINIMUM_NET_PROFIT_DAI}" DAI`
        );
    } catch (error) {
        console.warn('keeper: setup error, keeper will not run, please check that KEEPER_WALLET_PRIVATE_KEY is valid');
    }
};
