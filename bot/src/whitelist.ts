import { getCollateralConfigByType } from 'auctions-core/src/constants/COLLATERALS';
import { COLLATERAL_WHITELIST } from './variables';

const validateWhitelist = function (whitelist: string[]) {
    whitelist.forEach(collateralType => {
        getCollateralConfigByType(collateralType);
    });
};

export const parseCollateralWhitelist = function (whitelist: string): string[] {
    return whitelist.split(',').map(item => item.trim());
};

export const setupWhitelist = function (): void {
    if (COLLATERAL_WHITELIST) {
        const parsedWhitelist = parseCollateralWhitelist(COLLATERAL_WHITELIST);
        validateWhitelist(parsedWhitelist);
    } else {
        console.warn(`collateral whitelisting: skipping setup due to missing WHITELISTED_COLLATERALS`);
    }
};
