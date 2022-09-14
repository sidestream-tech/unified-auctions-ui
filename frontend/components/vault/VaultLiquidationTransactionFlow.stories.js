import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import VaultLiquidationTransactionFlow from '~/components/vault/VaultLiquidationTransactionFlow';
import {
    generateFakeLiquidationLimits,
    generateFakeVaultLiquidatedTransaction,
    generateFakeVaultNotLiquidatedTransaction,
} from '~/helpers/generateFakeVault';

const common = {
    components: { VaultLiquidationTransactionFlow },
    data: () => ({
        vaultTransaction: generateFakeVaultNotLiquidatedTransaction(),
        liquidationLimits: generateFakeLiquidationLimits(),

        isConnectingWallet: false,
        walletAddress: undefined,

        isRefreshingLimits: false,
    }),
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
    },
    template: `
        <VaultLiquidationTransactionFlow 
          v-bind="$data" 
          @connectWallet="connect" 
          @disconnectWallet="disconnect"
          @refreshLimits='refreshLimits'
        />`,
};

storiesOf('Vault/VaultLiquidationTransactionFlow', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Liquidated', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            vaultTransaction: generateFakeVaultLiquidatedTransaction(),
        }),
    }));
