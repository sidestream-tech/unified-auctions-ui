import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import VaultFlow from './VaultFlow';
import {
    generateFakeLiquidationLimits,
    generateFakeVaultLiquidatedTransaction,
    generateFakeVaultNotLiquidatedTransaction,
} from '~/helpers/generateFakeVault';

const vaultTransactions = [generateFakeVaultLiquidatedTransaction(), generateFakeVaultNotLiquidatedTransaction()];

const common = {
    components: {
        VaultFlow,
    },
    data() {
        return {
            vaultTransactions,
            selectedVaultAddress: vaultTransactions[1].address,

            vaultTransaction: generateFakeVaultNotLiquidatedTransaction(),
            liquidationLimits: generateFakeLiquidationLimits(),

            isConnectingWallet: false,
            walletAddress: undefined,

            isRefreshingLimits: false,
            isLiquidating: false,
        };
    },
    methods: {
        connect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletAddress = faker.finance.ethereumAddress();
                this.isConnectingWallet = false;
            }, 1000);
        },
        disconnect() {
            this.isConnectingWallet = true;
            setTimeout(() => {
                this.walletAddress = undefined;
                this.isConnectingWallet = false;
            }, 1000);
        },
        refreshLimits() {
            this.isRefreshingLimits = true;
            setTimeout(() => {
                this.liquidationLimits = {
                    maximumProtocolDebtDai: new BigNumber(1000000),
                    maximumCollateralDebtDai: new BigNumber(1000000),
                    currentProtocolDebtDai: new BigNumber(0),
                    currentCollateralDebtDai: new BigNumber(0),
                };
                this.isRefreshingLimits = false;
            }, 1000);
        },
        liquidate() {
            this.isLiquidating = true;
            setTimeout(() => {
                this.isLiquidating = false;
            }, 1000);
        },
    },
    template: `
        <VaultFlow 
          v-bind="$data" 
          @connectWallet="connect" 
          @disconnectWallet="disconnect"
          @refreshLimits='refreshLimits'
          @liquidate='liquidate'
        />`,
};

storiesOf('Vault/VaultFlow', module)
    .add('Default', () => ({
        ...common,
        template: `<VaultFlow  />`,
    }))
    .add('Default Expert', () => ({
        ...common,
        template: `<VaultFlow :isExplanationsShown='false'  />`,
    }))
    .add('Selected Vault', () => ({
        ...common,
    }))
    .add('Selected Vault Expert', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isExplanationsShown: false,
            };
        },
    }))
    .add('Selected Vault Liquidated', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                selectedVaultAddress: vaultTransactions[0].address,
            };
        },
    }))
    .add('Selected Vault Liquidated Expert', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                selectedVaultAddress: vaultTransactions[0].address,
                isExplanationsShown: false,
            };
        },
    }))
    .add('Selected Vault Loading', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransactions: [],
                areVaultsFetching: true,
            };
        },
    }));
