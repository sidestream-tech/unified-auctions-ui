import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { BigNumber } from 'bignumber.js';
import CollateralAuctionBidBlock from './CollateralAuctionBidBlock';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();

const common = {
    components: { CollateralAuctionBidBlock },
    data() {
        return {
            auction: fakeAuction,
            transactionBidAmount: new BigNumber(faker.finance.amount()),
        };
    },
};

storiesOf('Auction/Collateral/CollateralAuctionBidBlock', module)
    .add('Default', () => ({
        ...common,
        template:
            '<CollateralAuctionBidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" />',
    }))
    .add('Disabled', () => ({
        ...common,
        template:
            '<CollateralAuctionBidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" disabled />',
    }))
    .add('Loading', () => ({
        ...common,
        template:
            '<CollateralAuctionBidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" is-loading />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<CollateralAuctionBidBlock :auctionTransaction="auction" :transactionBidAmount="transactionBidAmount" :is-explanations-shown="false" />',
    }))
    .add('Finished', () => ({
        ...common,
        computed: {
            finishedAuction() {
                return {
                    ...fakeAuction,
                    transactionAddress: faker.finance.ethereumAddress(),
                };
            },
        },
        template:
            '<CollateralAuctionBidBlock :auctionTransaction="finishedAuction" :transactionBidAmount="transactionBidAmount" />',
    }));
