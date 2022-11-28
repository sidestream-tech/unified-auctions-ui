import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import VaultLiquidationLimitsCheckPanel from './VaultLiquidationLimitsCheckPanel';
import { generateFakeVaultNotLiquidatedTransaction } from '~/helpers/generateFakeVault';

const vaultTransaction = {
    ...generateFakeVaultNotLiquidatedTransaction(),
    maximumProtocolDebtDai: new BigNumber(faker.datatype.number({ min: 10000, max: 50000 })),
    currentProtocolDebtDai: new BigNumber(0),
    maximumCollateralDebtDai: new BigNumber(faker.datatype.number({ min: 10000, max: 50000 })),
    currentCollateralDebtDai: new BigNumber(0),
};

const common = {
    components: { VaultLiquidationLimitsCheckPanel },
    data() {
        return {
            vaultTransaction,
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
    .add('Partial Liquidation Possible', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransaction: {
                    ...vaultTransaction,
                    state: 'liquidatable',
                    debtDai: new BigNumber(faker.datatype.float({ min: 50000 })),
                },
            };
        },
    }))
    .add('No Liquidation Possible', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransaction: {
                    ...vaultTransaction,
                    state: 'not-liquidatable',
                    debtDai: new BigNumber(10000),
                    maximumProtocolDebtDai: new BigNumber(5000),
                    currentProtocolDebtDai: new BigNumber(5000),
                    maximumCollateralDebtDai: new BigNumber(5000),
                    currentCollateralDebtDai: new BigNumber(5000),
                },
            };
        },
    }))
    .add('Missing Liquidation Limits', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransaction: {},
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
