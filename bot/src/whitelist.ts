import { getCollateralConfigByType } from 'auctions-core/src/constants/COLLATERALS';
import { getSupportedCollateralTypes } from 'auctions-core/src/addresses';
import { WHITELISTED_COLLATERALS } from './variables';

const validateWhitelistedCollaterals = function (whitelist: string[]) {
    const unsupportedCollateralTypes: string[] = [];
    whitelist.forEach(collateralType => {
        try {
            getCollateralConfigByType(collateralType);
        } catch (error) {
            unsupportedCollateralTypes.push(collateralType);
        }
    });
    if (unsupportedCollateralTypes.length > 0) {
        throw new Error(
            `collateral whitelisting: no collaterals found for "${unsupportedCollateralTypes.toString()}"`
        );
    }
};

const parseWhitelistedCollaterals = function (whitelist: string): string[] {
    return whitelist.split(',').map(item => item.trim());
};

export const getWhitelistedCollaterals = async function (network: string) {
    if (WHITELISTED_COLLATERALS) {
        return parseWhitelistedCollaterals(WHITELISTED_COLLATERALS);
    }
    return await getSupportedCollateralTypes(network);
};

export const setupWhitelistedCollaterals = function () {
    if (!WHITELISTED_COLLATERALS) {
        console.warn(`no WHITELISTED_COLLATERALS env variable provided, activating all collateral auctions`);
    } else {
        const parsedWhitelist = parseWhitelistedCollaterals(WHITELISTED_COLLATERALS);
        validateWhitelistedCollaterals(parsedWhitelist);
        console.info(
            `WHITELISTED_COLLATERALS is provided, only fetching auctions of type "${WHITELISTED_COLLATERALS}"`
        );
    }
};
