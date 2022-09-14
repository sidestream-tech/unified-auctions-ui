import { storiesOf } from '@storybook/vue';
import VaultLiquidationTransactionTable from '~/components/vault/VaultLiquidationTransactionTable';
import {
    generateFakeVaultLiquidatedTransaction,
    generateFakeVaultNotLiquidatedTransaction,
} from '~/helpers/generateFakeVault';

const common = {
    components: { VaultLiquidationTransactionTable },
    data: () => ({
        vaultTransaction: generateFakeVaultNotLiquidatedTransaction(),
    }),
    template: '<VaultLiquidationTransactionTable :vaultTransaction="vaultTransaction" />',
};

storiesOf('Vault/VaultLiquidationTransactionTable', module)
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
