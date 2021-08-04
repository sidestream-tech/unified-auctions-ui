import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import MainText from './MainText';

storiesOf('MainText', module)
    .add('Without Props', () => ({
        components: { MainText },
        template: '<MainText />',
    }))
    .add('With Props', () => ({
        components: { MainText },
        data() {
            return {
                openAuctions: {
                    numberOfOpenAuctions: faker.datatype.number(),
                    openAuctionsTotalValue: faker.datatype.float(),
                    smallestAvailableVault: faker.datatype.float(),
                },
            };
        },
        template: '<MainText v-bind="openAuctions" />',
    }));
