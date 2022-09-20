import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import VaultsTable from './VaultsTable.vue';
import { generateFakeVaultTransactions } from '~/helpers/generateFakeVault';

const fakeVaultTransaction = generateFakeVaultTransactions();
const randomSelectedVault = faker.random.arrayElement(fakeVaultTransaction);

const common = {
    components: { VaultsTable },
    data: () => ({
        vaultTransactions: fakeVaultTransaction,
        selectedVaultId: randomSelectedVault.id,
        lastUpdated: new Date(faker.date.recent()),
    }),
};

storiesOf('Vault/VaultsTable', module)
    .add('Plain', () => ({
        ...common,
        template:
            '<VaultsTable :vaultTransactions="vaultTransactions" :selectedVaultId="selectedVaultId" :last-updated="lastUpdated" />',
    }))
    .add('Fetching With Vaults', () => ({
        ...common,
        template:
            '<VaultsTable :vaultTransactions="vaultTransactions" :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Fetching without Vaults', () => ({
        ...common,
        template: '<VaultsTable :last-updated="lastUpdated" :is-loading="true" />',
    }))
    .add('Empty vaults', () => ({
        ...common,
        template: '<VaultsTable :last-updated="lastUpdated" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<VaultsTable error="There was an error fetching the Vaults." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<VaultsTable :vaultTransactions="vaultTransactions" :selectedVaultId="selectedVaultId" show-more-rows :last-updated="lastUpdated" />',
    }));
