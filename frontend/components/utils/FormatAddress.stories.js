import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import FormatAddress from '~/components/utils/FormatAddress';

const common = {
    components: { FormatAddress },
    data() {
        return {
            walletAddress: faker.finance.ethereumAddress(),
        };
    },
};

storiesOf('Utils/FormatAddress', module).add('Default', () => ({
    ...common,
    template: '<FormatAddress :value="walletAddress" />',
}));
