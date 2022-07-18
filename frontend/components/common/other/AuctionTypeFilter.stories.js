import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import AuctionTypeFilter from '~/components/common/other/AuctionTypeFilter.vue';

const common = {
    components: { AuctionTypeFilter },
    methods: {
        select: action('selected'),
    },
};

storiesOf('Common/Other/AuctionTypeFilter', module)
    .add('Default', () => ({
        ...common,
        template: '<AuctionTypeFilter @selected="select" />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: '<AuctionTypeFilter @selected="select" :is-explanations-shown="false" />',
    }));
