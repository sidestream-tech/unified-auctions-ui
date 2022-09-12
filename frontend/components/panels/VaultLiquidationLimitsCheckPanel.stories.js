import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import VaultLiquidationLimitsCheckPanel from './VaultLiquidationLimitsCheckPanel';
import { generateFakeVaultNotLiquidatedTransaction } from '~/helpers/generateFakeVault';

const fakeVaultLiquidationTransaction = generateFakeVaultNotLiquidatedTransaction();
const liquidationLimits = {
    maximumProtocolDebtDai: fakeVaultLiquidationTransaction.maximumProtocolDebtDai,
    currentProtocolDebtDai: fakeVaultLiquidationTransaction.currentProtocolDebtDai,
    maximumCollateralDebtDai: fakeVaultLiquidationTransaction.maximumCollateralDebtDai,
    currentCollateralDebtDai: fakeVaultLiquidationTransaction.currentCollateralDebtDai,
};

const common = {
    components: { VaultLiquidationLimitsCheckPanel },
    data() {
        return {
            collateralType: fakeVaultLiquidationTransaction.collateralType,
            debtDai: new BigNumber(0),
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
    .add('Global Limits Reached', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                debtDai: new BigNumber(faker.finance.amount(1000)),
            };
        },
    }));
