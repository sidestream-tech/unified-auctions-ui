import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import Auction from './Auction.vue';
import { generateFakeAuction } from '~/helpers/generateFakeAuction';

const fakeAuction = generateFakeAuction();
const basicStory = {
    components: { Auction },
    computed: {
        auctionParams(): Auction {
            return {
                ...fakeAuction,
                moreData: '123',
            };
        },
    },
    data() {
        return {
            fakeAuction,
        };
    },
    methods: {
        vat: action('vat'),
        flashLoan: action('flashLoan'),
    },
};

storiesOf('Auction', module)
    .add('Default', () => ({
        ...basicStory,
        template: `<Auction :auction="auctionParams" @vat="vat" @flash-loan="flashLoan" />`,
    }))
    .add('Max Width', () => ({
        ...basicStory,
        template: `
        <div class="flex items-center w-3/5">    
            <Auction :auction="auctionParams" @vat="vat" @flash-loan="flashLoan" />
        </div>`,
    }));
