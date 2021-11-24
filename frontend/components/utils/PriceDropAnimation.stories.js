import { storiesOf } from '@storybook/vue';
import PriceDropAnimation from '~/components/utils/PriceDropAnimation';

const common = {
    components: { PriceDropAnimation },
};

storiesOf('Utils/PriceDropAnimation', module)
    .add('Default', () => ({
        ...common,
        data: () => ({
            auctionStartTime: new Date(Date.now() - 10000).toUTCString(),
        }),
        template: '<PriceDropAnimation :auctionStartDate="auctionStartTime" :dropDuration="90" />',
    }))
    .add('Invalid date', () => ({
        ...common,
        template: '<PriceDropAnimation auctionStartDate="invalid Date" :dropDuration="120" />',
    }))
    .add('Future date', () => ({
        ...common,
        data: () => ({
            auctionStartTime: new Date(Date.now() + 10000).toUTCString(),
        }),
        template: '<PriceDropAnimation :auctionStartDate="auctionStartTime" :dropDuration="90" />',
    }))
    .add('Far past date', () => ({
        ...common,
        data: () => ({
            auctionStartTime: new Date('9/22/15').toUTCString(),
        }),
        template: '<PriceDropAnimation :auctionStartDate="auctionStartTime" :dropDuration="90" />',
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            auctionStartTime: new Date('9/22/15').toUTCString(),
        }),
        template: '<PriceDropAnimation disabled :auctionStartDate="auctionStartTime" :dropDuration="90" />',
    }));
