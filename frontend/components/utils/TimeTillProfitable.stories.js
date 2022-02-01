import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import TimeTillProfitable from '~/components/utils/TimeTillProfitable';
import { generateFakeAuction } from '~/helpers/generateFakeAuction';

const auction = generateFakeAuction();

const common = {
    components: { TimeTillProfitable },
};

storiesOf('Utils/TimeTillProfitable', module)
    .add('Turns Profitable', () => ({
        ...common,
        data() {
            return {
                auction: {
                    ...auction,
                    transactionProfitDate: faker.date.soon(),
                },
            };
        },
        template: '<TimeTillProfitable :auction="auction" />',
    }))
    .add('Never Turns Profitable', () => ({
        ...common,
        data() {
            return {
                auction: {
                    ...auction,
                    transactionProfitDate: faker.date.future(),
                    endDate: faker.date.soon(),
                },
            };
        },
        template: '<TimeTillProfitable :auction="auction" />',
    }))
    .add('Already Profitable', () => ({
        ...common,
        data() {
            return {
                auction: {
                    ...auction,
                    marketUnitPrice: new BigNumber(faker.finance.amount(50, 150)),
                    approximateUnitPrice: new BigNumber(faker.finance.amount(0, 50)),
                    transactionProfitDate: undefined,
                },
            };
        },
        template: '<TimeTillProfitable :auction="auction" />',
    }))
    .add('Inactive Auction', () => ({
        ...common,
        data() {
            return {
                auction: {
                    ...auction,
                    isActive: false,
                    transactionProfitDate: undefined,
                },
            };
        },
        template: '<TimeTillProfitable :auction="auction" />',
    }))
    .add('Finished Auction', () => ({
        ...common,
        data() {
            return {
                auction: {
                    ...auction,
                    isFinished: true,
                    transactionProfitDate: undefined,
                },
            };
        },
        template: '<TimeTillProfitable :auction="auction" />',
    }));
