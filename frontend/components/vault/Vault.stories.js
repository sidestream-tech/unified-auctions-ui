import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import Vault from './Vault';
import {
    generateFakeVaultLiquidatedTransaction,
    generateFakeVaultNotLiquidatedTransaction,
} from '~/helpers/generateFakeVault';

const fakeVaultNotLiquidatedTransaction = generateFakeVaultNotLiquidatedTransaction();
const fakeVaultLiquidatedTransaction = generateFakeVaultLiquidatedTransaction();

const common = {
    components: {
        Vault,
    },
    data() {
        return {
            vault: fakeVaultNotLiquidatedTransaction,
            vaultId: fakeVaultLiquidatedTransaction.id.toString(),
        };
    },
    methods: {
        liquidate: action('liquidate'),
    },
};

storiesOf('Vault/Vault', module)
    .add('Default', () => ({
        ...common,
        template: `<Vault :vaultTransaction="vault" :vaultId='vaultId' @liquidate="liquidate" />`,
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                vault: fakeVaultLiquidatedTransaction,
                vaultId: fakeVaultLiquidatedTransaction.id.toString(),
            };
        },
        template: `<Vault :vaultTransaction="vault" :vaultId='vaultId' @liquidate="liquidate" />`,
    }))
    .add('Fetching', () => ({
        ...common,
        template: `<Vault :are-vaults-fetching='true' :vaultId='vaultId' />`,
    }))
    .add('Not found', () => ({
        ...common,
        template: `<Vault :vaultId='vaultId' />`,
    }))
    .add('Invalid Date', () => ({
        ...common,
        data() {
            return {
                vault: {
                    ...fakeVaultNotLiquidatedTransaction,
                    nextPriceChange: 'Invalid Date',
                },
                vaultId: fakeVaultLiquidatedTransaction.id.toString(),
            };
        },
        template: `<Vault :vaultTransaction="vault" :vaultId='vaultId' @liquidate="liquidate" />`,
    }));
