import { storiesOf } from '@storybook/vue';
import TimeTillProfitable from '~/components/utils/TimeTillProfitable';
import { generateFakeAuction } from '~/helpers/generateFakeAuction';

const auction = generateFakeAuction();

const common = {
    components: { TimeTillProfitable },
    data() {
        return {
            auction,
        };
    },
};

storiesOf('Utils/TimeTillProfitable', module).add('Default', () => ({
    ...common,
    template: '<TimeTillProfitable :auction="auction" />',
}));
