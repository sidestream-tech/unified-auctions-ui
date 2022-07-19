import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import CollateralAuctionExecuteWithOtherWalletBlock from './CollateralAuctionExecuteWithOtherWalletBlock';

const common = {
    components: { CollateralAuctionExecuteWithOtherWalletBlock },
    data() {
        return {
            outcomeWallet: faker.finance.ethereumAddress(),
            defaultWallet: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        execute: action('execute'),
    },
};

storiesOf('Auction/Collateral/CollateralAuctionExecuteWithOtherWalletBlock', module).add('Default', () => ({
    ...common,
    template:
        '<CollateralAuctionExecuteWithOtherWalletBlock :outcomeWallet="outcomeWallet" :defaultWallet="defaultWallet" @execute="execute" />',
}));
