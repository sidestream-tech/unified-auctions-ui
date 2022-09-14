import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import VaultLiquidationTransactionFlow from '~/components/vault/VaultLiquidationTransactionFlow';
import {
    generateFakeVaultLiquidatedTransaction,
    generateFakeVaultNotLiquidatedTransaction,
} from '~/helpers/generateFakeVault';

const common = {
    components: { VaultLiquidationTransactionFlow },
    data: () => ({
        vaultTransaction: generateFakeVaultNotLiquidatedTransaction(),
        network: 'mainnet',

        isConnectingWallet: false,
        walletAddress: undefined,
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
    },
    template: `
        <VaultLiquidationTransactionFlow 
          v-bind="$data" 
          @connectWallet="connect" 
          @disconnectWallet="disconnect"
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
