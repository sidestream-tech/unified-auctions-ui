import { storiesOf } from '@storybook/vue';
import SurplusAuctionsTable from '~/components/surplus/SurplusAuctionsTable';
import { generateFakeSurplusAuctions } from '~/helpers/generateFakeSurplusAuction';

const auctions = generateFakeSurplusAuctions();

const common = {
    components: { SurplusAuctionsTable },
    data: () => ({
        auctions,
    }),
};

storiesOf('Surplus/SurplusAuctionsTable', module).add('Default', () => ({
    ...common,
    template: '<SurplusAuctionsTable :auctions="auctions" />',
}));
