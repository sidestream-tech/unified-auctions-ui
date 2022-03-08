import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import BidTransactionTable from './BidTransactionTable';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    components: { BidTransactionTable },
    data() {
        return {
            auctionTransaction: {
                ...fakeAuction,
                isFinished: false,
                isActive: true,
            },
            minimumDepositDAI: new BigNumber(faker.finance.amount(0, 50)),
        };
    },
};

storiesOf('Transaction/BidTransactionTable', module)
    .add('Default', () => ({
        ...common,
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDai="minimumDepositDAI" />',
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isFinished: true,
                },
            };
        },
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDAI="minimumDepositDAI" />',
    }))
    .add('Inactive', () => ({
        ...common,
        data() {
            return {
                auctionTransaction: {
                    ...fakeAuction,
                    isActive: false,
                    isFinished: false,
                },
            };
        },
        template:
            '<BidTransactionTable :auctionTransaction="auctionTransaction" :minimumDepositDAI="minimumDepositDAI" />',
    }));
