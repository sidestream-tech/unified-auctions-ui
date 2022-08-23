import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
import {
    KEEPER_COLLATERAL,
    KEEPER_SURPLUS,
    KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI,
    KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI,
    KEEPER_WALLET_PRIVATE_KEY,
} from '../variables';
import { executePreAuthorizationsIfRequested } from '../authorisation';

export const isSetupCompleted = (isSetupCompleted: boolean = false): boolean => {
    return isSetupCompleted;
};

export const setupKeeper = async function (network: string) {
    if (!KEEPER_WALLET_PRIVATE_KEY) {
        console.warn('keeper: KEEPER_WALLET_PRIVATE_KEY variable is not set, keeper will not run');
        return;
    }

    if (!KEEPER_COLLATERAL && !KEEPER_SURPLUS) {
        return console.warn(
            'keeper: KEEPER_SURPLUS and KEEPER_COLLATERAL are set to false or undefined. Keeper will not run.'
        );
    }

    if (KEEPER_COLLATERAL && Number.isNaN(KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI)) {
        console.warn(
            'keeper: KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI is not set. Collateral auctions will not be taken.'
        );
    }

    if (KEEPER_SURPLUS && Number.isNaN(KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI)) {
        console.warn('keeper: KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI is not set. Surplus auctions will not be taken.');
    }

    try {
        setSigner(network, createSigner(network, KEEPER_WALLET_PRIVATE_KEY));
        const signer = await getSigner(network);
        const address = await signer.getAddress();
        isSetupCompleted(true);
        console.info('keeper: setup complete');
        if (KEEPER_COLLATERAL && !Number.isNaN(KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI)) {
            console.info(
                `keeper: using wallet "${address}", looking for minimum clear profit of "${KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI}" DAI in collateral auctions`
            );
        }
        if (KEEPER_SURPLUS && !Number.isNaN(KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI)) {
            console.info(
                `keeper: using wallet "${address}", looking for minimum clear profit of "${KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI}" DAI in surplus auctions`
            );
        }
        await executePreAuthorizationsIfRequested(network);
        return;
    } catch (error) {
        console.warn('keeper: setup error, keeper will not run, please check that KEEPER_WALLET_PRIVATE_KEY is valid');
    }
};
