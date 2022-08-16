import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import {
    KEEPER_MINIMUM_NET_PROFIT_DAI_COLLATERAL,
    KEEPER_MINIMUM_NET_PROFIT_DAI_SURPLUS,
    KEEPER_WALLET_PRIVATE_KEY,
} from '../variables';

export const isSetupCompleted = (isSetupCompleted: boolean = false): boolean => {
    return isSetupCompleted;
};

export const setupKeeper = async function (network: string) {
    if (!KEEPER_WALLET_PRIVATE_KEY) {
        console.warn('keeper: KEEPER_WALLET_PRIVATE_KEY variable is not set, keeper will not run');
        return;
    }
    if (
        Number.isNaN(KEEPER_MINIMUM_NET_PROFIT_DAI_COLLATERAL) &&
        Number.isNaN(KEEPER_MINIMUM_NET_PROFIT_DAI_SURPLUS)
    ) {
        console.warn(
            'keeper: KEEPER_MINIMUM_NET_PROFIT_DAI_COLLATERAL and KEEPER_MINIMUM_NET_PROFIT_DAI_SURPLUS are not set or not numbers, keeper will not run'
        );
        return;
    }
    try {
        setSigner(network, createSigner(network, KEEPER_WALLET_PRIVATE_KEY));
        const signer = await getSigner(network);
        const address = await signer.getAddress();
        isSetupCompleted(true);
        if (!Number.isNaN(KEEPER_MINIMUM_NET_PROFIT_DAI_COLLATERAL)) {
            console.info(
                `keeper: setup complete: using wallet "${address}", looking for minimum clear profit of "${KEEPER_MINIMUM_NET_PROFIT_DAI_COLLATERAL}" DAI`
            );
        }
        if (!Number.isNaN(KEEPER_MINIMUM_NET_PROFIT_DAI_SURPLUS)) {
            console.info(
                `keeper: setup complete: using wallet "${address}", looking for minimum clear profit of "${KEEPER_MINIMUM_NET_PROFIT_DAI_SURPLUS}" DAI`
            );
        }
    } catch (error) {
        console.warn('keeper: setup error, keeper will not run, please check that KEEPER_WALLET_PRIVATE_KEY is valid');
    }
};
