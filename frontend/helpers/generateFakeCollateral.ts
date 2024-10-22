import faker from 'faker';
import BigNumber from 'bignumber.js';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import type { CollateralRow, CollateralStatus } from 'auctions-core/src/types';

export const generateFakeCollaterals = function () {
    const collaterals: CollateralRow[] = [];

    for (const collateralObject of Object.values(COLLATERALS)) {
        collaterals.push({
            ...collateralObject,
            marketUnitPrice: new BigNumber(faker.finance.amount()),
            secondsBetweenPriceDrops: faker.datatype.number(120),
            priceDropRatio: new BigNumber(faker.datatype.number({ min: 0.5, max: 1, precision: 0.0001 })),
            tokenAddress: faker.finance.ethereumAddress(),
            autoRouteQuote: new BigNumber(faker.finance.amount()),
            autoRouteExchanges: [faker.lorem.word(), faker.lorem.word()],
        });
    }
    return collaterals;
};

export const generateFakeCollateralStatuses = function () {
    const collateralStatuses: CollateralStatus[] = [];

    for (const collateral of Object.values(COLLATERALS)) {
        collateralStatuses.push({
            type: collateral.ilk,
            symbol: collateral.symbol,
            tokenName: collateral.tokenName,
            address: faker.finance.ethereumAddress(),
            isAuthorized: faker.datatype.boolean(),
            isAuthorizing: false,
            balance: new BigNumber(faker.finance.amount()),
            isDepositingOrWithdrawing: false,
        });
    }
    return collateralStatuses;
};
