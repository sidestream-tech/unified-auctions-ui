import { storiesOf } from '@storybook/vue';
import PriceDropAnimation from './PriceDropAnimation';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();
const common = {
    components: { PriceDropAnimation },
};

storiesOf('Auction/Collateral/PriceDropAnimation', module).add('Default', () => ({
    ...common,
    data: () => ({
        fakeAuction,
    }),
    template: '<PriceDropAnimation :auction="fakeAuction" />',
}));
