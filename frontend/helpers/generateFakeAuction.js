import faker from 'faker';

export const fakeAuction = {
    id: faker.datatype.number(),
    collateralType: faker.lorem.word(),
    amountRAW: faker.finance.amount(),
    amountDAI: faker.finance.amount(),
    till: faker.date.future(),
};
