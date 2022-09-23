import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import VaultLiquidationLimitsCheckPanel from './VaultLiquidationLimitsCheckPanel';
import { generateFakeVaultNotLiquidatedTransaction } from '~/helpers/generateFakeVault';

const vaultTransaction = generateFakeVaultNotLiquidatedTransaction();

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
    .add('Global Limits Reached', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransaction: {
                    ...vaultTransaction,
                    debtDai: new BigNumber(faker.datatype.float({ min: 1000 })),
                    incentiveRelativeDai: new BigNumber(faker.finance.amount()),
                    incentiveConstantDai: new BigNumber(faker.finance.amount()),
                },
            };
        },
    }))
    .add('Collateral Limits Reached', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransaction: {
                    ...vaultTransaction,
                    debtDai: new BigNumber(faker.datatype.float({ min: 1000 })),
                    incentiveRelativeDai: new BigNumber(faker.finance.amount()),
                    incentiveConstantDai: new BigNumber(faker.finance.amount()),
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
