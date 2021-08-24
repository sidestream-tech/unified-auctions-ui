import faker from 'faker';
import { map } from 'lodash';

export const generateFakeAuction = function () {
    return {
        id: faker.datatype.number().toString(),
        collateralType: faker.lorem.word(),
        amountRAW: faker.finance.amount(),
        amountDAI: faker.finance.amount(),
        till: faker.date.future(),
    };
};

export const generateFakeAuctions = function (number = 1) {
    const auctions = map(Array(number), () => generateFakeAuction());
    return auctions;
};
