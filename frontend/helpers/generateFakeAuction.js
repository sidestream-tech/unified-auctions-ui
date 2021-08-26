import faker from 'faker';
import { map } from 'lodash';

export const generateFakeAuction = function () {
    const amountRAW = parseFloat(faker.finance.amount());
    const amountDAI = parseFloat(faker.finance.amount());

    return {
        id: faker.datatype.number().toString(),
        collateralType: faker.lorem.word(),
        amountRAW,
        amountDAI,
        till: faker.date.future(),
        marketValue: faker.datatype.number({ min: -1, max: 1, precision: 0.001 }),
        vaultOwner: faker.finance.ethereumAddress(),
        amountPerCollateral: amountDAI / amountRAW,
    };
};

export const generateFakeAuctions = function (number = 1) {
    const auctions = map(Array(number), () => generateFakeAuction());
    return auctions;
};
