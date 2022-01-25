import faker from 'faker';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';

export const generateFakeCollaterals = function () {
    const collaterals = [];

    for (const collateralObject of Object.values(COLLATERALS)) {
        collaterals.push({
            ilk: collateralObject.ilk,
            symbol: collateralObject.symbol,
            marketUnitPrice: isOnChain ? new BigNumber(faker.finance.amount()) : undefined,
            secondsBetweenPriceDrops: isOnChain ? new BigNumber(faker.datatype.number(120)) : undefined,
            priceDropRatio: isOnChain
                ? new BigNumber(faker.datatype.number({ min: 0.5, max: 1, precision: 0.0001 }))
                : undefined,
            isOnChain,
        });
    }
    return collaterals;
};
