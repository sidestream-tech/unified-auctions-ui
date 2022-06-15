import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import SurplusAuctionsTable from '~/components/surplus/SurplusAuctionsTable';
import { generateFakeSurplusAuctionsData } from '~/helpers/generateFakeSurplusAuction';

const surplusAuctions = generateFakeSurplusAuctionsData();

const common = {
    components: { SurplusAuctionsTable },
    data: () => ({
        auctions: surplusAuctions,
    }),
    methods: {
        accept: action('accept'),
        close: action('close'),
    },
};

storiesOf('Surplus/SurplusAuctionsTable', module).add('Default', () => ({
    ...common,
    template: '<SurplusAuctionsTable :auctions="auctions" />',
}));
