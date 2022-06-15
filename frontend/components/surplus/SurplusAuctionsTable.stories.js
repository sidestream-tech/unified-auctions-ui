import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import SurplusAuctionsTable from '~/components/surplus/SurplusAuctionsTable';

const common = {
    components: { SurplusAuctionsTable },
    data: () => ({
        show: true,
    }),
    methods: {
        accept: action('accept'),
        close: action('close'),
    },
};

storiesOf('Surplus/SurplusAuctionsTable', module).add('Default', () => ({
    ...common,
    template: '<SurplusAuctionsTable />',
}));
