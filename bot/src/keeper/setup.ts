import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import {
    KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI,
    KEEPER_SURPLUS_MAXIMUM_MKR_PER_DAI,
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
    if (Number.isNaN(KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI) && Number.isNaN(KEEPER_SURPLUS_MAXIMUM_MKR_PER_DAI)) {
        console.warn(
            'keeper: KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI and KEEPER_SURPLUS_MAXIMUM_MKR_PER_DAI are not set or not numbers, keeper will not run'
        );
        return;
    }
    try {
        setSigner(network, createSigner(network, KEEPER_WALLET_PRIVATE_KEY));
        const signer = await getSigner(network);
        const address = await signer.getAddress();
        isSetupCompleted(true);
        console.info('keeper: setup complete');
        if (!Number.isNaN(KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI)) {
            console.info(
                `keeper: using wallet "${address}", looking for minimum clear profit of "${KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI}" DAI`
            );
        }
        if (!Number.isNaN(KEEPER_SURPLUS_MAXIMUM_MKR_PER_DAI)) {
            console.info(
                `keeper: using wallet "${address}", looking for maximum unit price of "${KEEPER_SURPLUS_MAXIMUM_MKR_PER_DAI}" MKR per DAI`
            );
        }
    } catch (error) {
        console.warn('keeper: setup error, keeper will not run, please check that KEEPER_WALLET_PRIVATE_KEY is valid');
    }
};
