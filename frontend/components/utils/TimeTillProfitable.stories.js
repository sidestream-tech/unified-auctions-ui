import { storiesOf } from '@storybook/vue';
import faker from 'faker';
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
                    transactionProfitDate: faker.date.recent(),
                },
            };
        },
        template: '<TimeTillProfitable :auction="auction" />',
    }))
    .add('Inactive / Finished Auction', () => ({
        ...common,
        data() {
            return {
                auction: {
                    ...auction,
                    isActive: false,
                },
            };
        },
        template: '<TimeTillProfitable :auction="auction" />',
    }));
