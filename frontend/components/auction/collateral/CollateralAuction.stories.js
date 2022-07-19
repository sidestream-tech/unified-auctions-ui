import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import CollateralAuction from './CollateralAuction';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeCollateralAuction = generateFakeAuctionTransaction();

const common = {
    components: {
        CollateralAuction,
    },
    data() {
        return {
            auction: fakeCollateralAuction,
        };
    },
    methods: {
        bid: action('bid'),
    },
};

storiesOf('Auction/Collateral/CollateralAuction', module)
    .add('Default', () => ({
        ...common,
        template: `<CollateralAuction :auction="auction" auctionId="1" @bid="bid" />`,
    }))
    .add('Finished', () => ({
        ...common,
        template: `<CollateralAuction :auction="auction" auctionId="1" @bid="bid" error="This auction is finished" />`,
    }));
