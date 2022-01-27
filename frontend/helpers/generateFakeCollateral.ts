import faker from 'faker';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import type { CollateralRow } from 'auctions-core/src/types';

export const generateFakeCollaterals = function () {
    const collaterals: CollateralRow[] = [];

    for (const collateralObject of Object.values(COLLATERALS)) {
        collaterals.push({
            ...collateralObject,
            marketUnitPrice: new BigNumber(faker.finance.amount()),
            secondsBetweenPriceDrops: faker.datatype.number(120),
            priceDropRatio: new BigNumber(faker.datatype.number({ min: 0.5, max: 1, precision: 0.0001 })),
            tokenAddress: faker.finance.ethereumAddress(),
        });
    }
    return collaterals;
};
