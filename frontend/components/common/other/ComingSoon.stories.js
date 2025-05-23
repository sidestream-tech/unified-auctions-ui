import { storiesOf } from '@storybook/vue';
import ComingSoon from './ComingSoon';

const common = {
    components: { ComingSoon },
    data: () => ({
        lastUpdated: 1635336000000,
    }),
};

storiesOf('Common/Other/ComingSoon', module).add('Default', () => ({
    ...common,
    template: '<ComingSoon :last-updated="lastUpdated" />',
}));
