import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import { COLLATERAL_WHITELIST } from './variables';

const validateWhitelist = function (whitelist: string[]) {
    whitelist.map(collateralType => {
        if (!COLLATERALS[collateralType]) {
            throw new Error(`whitelist: incorrect collateral type found "${collateralType}"`);
        }
        return true;
    });
};

export const parseCollateralWhitelist = function (whitelist: string): string[] {
    const whitelistNoSpaces = whitelist.replace(/\s/g, '');
    return whitelistNoSpaces.split(',');
};

export const setupWhitelist = function (): void {
    if (COLLATERAL_WHITELIST) {
        const parsedWhitelist = parseCollateralWhitelist(COLLATERAL_WHITELIST);
        validateWhitelist(parsedWhitelist);
    } else {
        console.warn(`whitelist: skipping setup due to missing collateral whitelist`);
    }
};
