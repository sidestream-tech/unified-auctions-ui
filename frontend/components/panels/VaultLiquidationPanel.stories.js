import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import { getAllCollateralTypes } from 'auctions-core/src/constants/COLLATERALS.ts';
import VaultLiquidationPanel from './VaultLiquidationPanel';
import { generateFakeLiquidationLimits } from '~/helpers/generateFakeVault';

const COLLATERALS = getAllCollateralTypes();
const liquidationLimits = generateFakeLiquidationLimits();

const common = {
    components: { VaultLiquidationPanel },
    data() {
        return {
            auctionId: '1',
            auctionState: 'liquidatable',
            collateralType: faker.helpers.randomize(Object.values(COLLATERALS)),
            debtDai: new BigNumber(0),
            incentiveRelativeDai: new BigNumber(0),
            incentiveConstantDai: new BigNumber(0),
            liquidationLimits,
            isExplanationsShown: true,
            isWalletConnected: true,
            isLiquidating: false,
            walletAddress: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        liquidate: action('liquidate'),
    },
    template: '<VaultLiquidationPanel v-bind="$data" @liquidate="liquidate" />',
};

storiesOf('Panels/VaultLiquidationPanel', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Expert Mode', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isExplanationsShown: false,
            };
        },
    }))
    .add('Wallet Not Connected', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isWalletConnected: false,
            };
        },
    }))
    .add('Not Liquidatable State', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                auctionState: 'not-liquidatable',
            };
        },
    }))
    .add('No Liquidation Limits', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                liquidationLimits: {},
            };
        },
    }))
    .add('Liquidation Limits Reached', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                debtDai: new BigNumber(faker.datatype.float({ min: 1000 })),
                incentiveRelativeDai: new BigNumber(faker.finance.amount()),
                incentiveConstantDai: new BigNumber(faker.finance.amount()),
            };
        },
    }));
