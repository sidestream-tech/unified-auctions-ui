import { getCollateralConfigByType } from 'auctions-core/src/constants/COLLATERALS';
import { WHITELISTED_COLLATERALS } from './variables';

const validateWhitelist = function (whitelist: string[]) {
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

export const parseCollateralWhitelist = function (whitelist: string): string[] {
    return whitelist.split(',').map(item => item.trim());
};

export const getWhitelistedCollaterals = function () {
    if (WHITELISTED_COLLATERALS) {
        return parseCollateralWhitelist(WHITELISTED_COLLATERALS);
    }
    return undefined;
};

export const setupWhitelist = function () {
    if (WHITELISTED_COLLATERALS) {
        const parsedWhitelist = parseCollateralWhitelist(WHITELISTED_COLLATERALS);
        validateWhitelist(parsedWhitelist);
        console.info(
            `collateral whitelisting: whitelist is enabled, only fetching auctions of type "${WHITELISTED_COLLATERALS}"`
        );
    } else {
        console.warn(`collateral whitelisting: skipping setup due to missing WHITELISTED_COLLATERALS`);
    }
};
