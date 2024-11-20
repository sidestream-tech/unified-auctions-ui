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
            vaultAddress: fakeVaultLiquidatedTransaction.address,
        };
    },
    methods: {
        liquidate: action('liquidate'),
    },
};

storiesOf('Vault/Vault', module)
    .add('Default', () => ({
        ...common,
        template: `<Vault :vaultTransaction="vault" :vaultAddress='vaultAddress' @liquidate="liquidate" />`,
    }))
    .add('Finished', () => ({
        ...common,
        data() {
            return {
                vault: fakeVaultLiquidatedTransaction,
                vaultAddress: fakeVaultLiquidatedTransaction.address,
            };
        },
        template: `<Vault :vaultTransaction="vault" :vaultAddress='vaultAddress' @liquidate="liquidate" />`,
    }))
    .add('Fetching', () => ({
        ...common,
        template: `<Vault :are-vaults-fetching='true' :vaultAddress='vaultAddress' />`,
    }))
    .add('Not found', () => ({
        ...common,
        template: `<Vault :vaultAddress='vaultAddress' />`,
    }))
    .add('Invalid Date', () => ({
        ...common,
        data() {
            return {
                vault: {
                    ...fakeVaultNotLiquidatedTransaction,
                    nextPriceChange: 'Invalid Date',
                },
                vaultAddress: fakeVaultLiquidatedTransaction.address,
            };
        },
        template: `<Vault :vaultTransaction="vault" :vaultAddress='vaultAddress' @liquidate="liquidate" />`,
    }));
