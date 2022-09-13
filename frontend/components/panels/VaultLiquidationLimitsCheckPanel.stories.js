import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import { getAllCollateralTypes } from 'auctions-core/src/constants/COLLATERALS.ts';
import VaultLiquidationLimitsCheckPanel from './VaultLiquidationLimitsCheckPanel';
import { generateFakeLiquidationLimits } from '~/helpers/generateFakeVault';

const COLLATERALS = getAllCollateralTypes();
const liquidationLimits = generateFakeLiquidationLimits();

const common = {
    components: { VaultLiquidationLimitsCheckPanel },
    data() {
        return {
            collateralType: faker.helpers.randomize(COLLATERALS),
            debtDai: new BigNumber(0),
            incentiveRelativeDai: new BigNumber(0),
            incentiveConstantDai: new BigNumber(0),
            liquidationLimits,
            isExplanationsShown: true,
            isRefreshing: false,
        };
    },
    methods: {
        refreshLimits() {
            this.isRefreshing = true;
            setTimeout(() => {
                this.isRefreshing = false;
            }, 1000);
        },
    },
    template: '<VaultLiquidationLimitsCheckPanel v-bind="$data" @refreshLimits="refreshLimits" />',
};

storiesOf('Panels/VaultLiquidationLimitsCheckPanel', module)
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
    .add('Global Limits Reached', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                debtDai: new BigNumber(faker.datatype.float({ min: 1000 })),
                incentiveRelativeDai: new BigNumber(faker.finance.amount()),
                incentiveConstantDai: new BigNumber(faker.finance.amount()),
            };
        },
    }))
    .add('Collateral Limits Reached', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                liquidationLimits: {
                    ...liquidationLimits,
                    maximumProtocolDebtDai: new BigNumber(faker.datatype.float({ min: 5000 })),
                },
                debtDai: new BigNumber(faker.datatype.float({ min: 1000, max: 2000 })),
                incentiveRelativeDai: new BigNumber(faker.finance.amount()),
                incentiveConstantDai: new BigNumber(faker.finance.amount()),
            };
        },
    }))
    .add('Empty Liquidation Limits', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                liquidationLimits: {},
            };
        },
    }))
    .add('No Global Liquidation Limits', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                liquidationLimits: {
                    ...liquidationLimits,
                    maximumProtocolDebtDai: undefined,
                },
            };
        },
    }))
    .add('No Collateral Liquidation Limits', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                liquidationLimits: {
                    ...liquidationLimits,
                    maximumCollateralDebtDai: undefined,
                },
            };
        },
    }))
    .add('Refreshing', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isRefreshing: true,
            };
        },
    }));
