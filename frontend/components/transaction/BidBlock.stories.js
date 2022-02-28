import { storiesOf } from '@storybook/vue';
import BidBlock from './BidBlock';
import { generateFakeAuction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuction();

const common = {
    components: { BidBlock },
    data() {
        return {
            auction: fakeAuction,
        };
    },
};

storiesOf('Transaction/BidBlock', module)
    .add('Default', () => ({
        ...common,
        template: `
    <BidBlock 
        :totalPrice="auction.totalPrice"
        :collateralAmount="auction.collateralAmount"
        :collateralSymbol="auction.collateralSymbol"
    />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
    <BidBlock 
        :totalPrice="auction.totalPrice"
        :collateralAmount="auction.collateralAmount"
        :collateralSymbol="auction.collateralSymbol"
        disabled
    />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `
        <BidBlock 
            :totalPrice="auction.totalPrice"
            :collateralAmount="auction.collateralAmount"
            :collateralSymbol="auction.collateralSymbol"
            is-loading
        />`,
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: `
        <BidBlock 
            :totalPrice="auction.totalPrice"
            :collateralAmount="auction.collateralAmount"
            :collateralSymbol="auction.collateralSymbol"
            :is-explanations-shown="false"
        />`,
    }));
