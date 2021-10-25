import { storiesOf } from '@storybook/vue';
import ComingSoon from '~/components/ComingSoon';

const common = {
    components: { ComingSoon },
    data: () => ({
        lastUpdated: 1635336000000,
    }),
};

storiesOf('ComingSoon', module).add('Default', () => ({
    ...common,
    template: '<ComingSoon :last-updated="lastUpdated" />',
}));
