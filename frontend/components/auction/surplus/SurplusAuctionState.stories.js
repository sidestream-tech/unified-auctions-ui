import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SurplusAuctionState from './SurplusAuctionState';

const common = {
    components: { SurplusAuctionState },
    data: () => ({
        state: faker.helpers.randomize([
            'just-started',
            'have-bids',
            'ready-for-collection',
            'requires-restart',
            'collected',
        ]),
        endDate: new Date(faker.date.recent()),
    }),
};

storiesOf('Auction/Surplus/SurplusAuctionState', module).add('Default', () => ({
    ...common,
    template: '<SurplusAuctionState :state="state" :end-date="endDate" />',
}));
