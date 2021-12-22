import { storiesOf } from '@storybook/vue';
import PriceDropAnimation from '~/components/utils/PriceDropAnimation';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuctionTransaction();
const common = {
    components: { PriceDropAnimation },
};

storiesOf('Utils/PriceDropAnimation', module).add('Default', () => ({
    ...common,
    data: () => ({
        fakeAuction,
    }),
    template: '<PriceDropAnimation :auction="fakeAuction" />',
}));
