import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import SurplusAuction from './SurplusAuction.vue';
import { generateFakeAuction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuction();
const basicStory = {
    components: {
        SurplusAuction,
    },
    computed: {
        auctionParams() {
            return {
                ...fakeAuction,
            };
        },
    },
    data() {
        return {
            fakeAuction,
        };
    },
    methods: {
        swap: action('swap'),
    },
};

storiesOf('SurplusAuction', module)
    .add('Default', () => ({
        ...basicStory,
        template: `<SurplusAuction :auction="auctionParams" auctionId="test" @swap="swap"/>`,
    }))
    .add('Max Width', () => ({
        ...basicStory,
        template: `
        <div class="flex items-center w-3/5">
            <SurplusAuction :auction="auctionParams" auctionId="test" @swap="swap"/>
        </div>`,
    }))
    .add('Finished', () => ({
        ...basicStory,
        template: `
        <div class="flex items-center w-3/5">
            <SurplusAuction :auction="auctionParams" auctionId="test" error="This auction is finished"/>
        </div>`,
    }));
