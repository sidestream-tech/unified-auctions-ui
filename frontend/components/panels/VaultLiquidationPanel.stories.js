import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import VaultLiquidationPanel from './VaultLiquidationPanel';
import { generateFakeVaultNotLiquidatedTransaction } from '~/helpers/generateFakeVault';

const fakeVaultLiquidationTransaction = generateFakeVaultNotLiquidatedTransaction();
const liquidationLimits = {
    maximumProtocolDebtDai: fakeVaultLiquidationTransaction.maximumProtocolDebtDai,
    currentProtocolDebtDai: fakeVaultLiquidationTransaction.currentProtocolDebtDai,
    maximumCollateralDebtDai: fakeVaultLiquidationTransaction.maximumCollateralDebtDai,
    currentCollateralDebtDai: fakeVaultLiquidationTransaction.currentCollateralDebtDai,
};

const common = {
    components: { VaultLiquidationPanel },
    data() {
        return {
            auctionId: '1',
            auctionState: fakeVaultLiquidationTransaction.state,
            collateralType: fakeVaultLiquidationTransaction.collateralType,
            debtDai: new BigNumber(0),
            liquidationLimits,
            isExplanationsShown: true,
            isWalletConnected: true,
            isLiquidating: false,
        };
    },
    methods: {
        liquidate() {
            this.isLiquidating = true;
            setTimeout(() => {
                this.isLiquidating = false;
            }, 1000);
        },
        chooseWallet: action('chooseWallet'),
    },
    template: '<VaultLiquidationPanel v-bind="$data" @liquidate="liquidate" @chooseWallet="chooseWallet" />',
};

storiesOf('Panels/VaultLiquidationPanel', module)
    .add('Default', () => ({
        ...common,
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
    .add('Global Limits Reached', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                debtDai: new BigNumber(faker.finance.amount(1000)),
            };
        },
    }));
