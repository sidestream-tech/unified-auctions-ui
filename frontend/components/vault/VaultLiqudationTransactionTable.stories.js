import { storiesOf } from '@storybook/vue';
import VaultLiqudationTransactionTable from './VaultLiqudationTransactionTable';
import { generateFakeVaultNotLiquidatedTransaction } from '~/helpers/generateFakeVault';

const common = {
    components: { VaultLiqudationTransactionTable },
    data: () => ({
        auction: generateFakeVaultNotLiquidatedTransaction(),
    }),
    template: '<VaultLiqudationTransactionTable :auction="auction" />',
};

storiesOf('Auction/Vault/VaultLiqudationTransactionTable', module).add('Default', () => ({
    ...common,
}));
