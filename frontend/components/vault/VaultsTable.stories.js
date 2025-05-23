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
        selectedVaultAddress: randomSelectedVault.address,
        lastUpdated: new Date(faker.date.recent()),
        isLoading: false,
    }),
};

storiesOf('Vault/VaultsTable', module)
    .add('Plain', () => ({
        ...common,
        template:
            '<VaultsTable :vaultTransactions="vaultTransactions" :selectedVaultAddress="selectedVaultAddress" :last-updated="lastUpdated" />',
    }))
    .add('Reset Updated Timer', () => ({
        ...common,
        created() {
            setInterval(() => {
                this.isLoading = true;
                setTimeout(() => {
                    this.isLoading = false;
                }, 1000);
                this.lastUpdated = new Date(faker.date.recent());
            }, 10 * 1000);
        },
        template:
            '<VaultsTable :vaultTransactions="vaultTransactions" :selectedVaultAddress="selectedVaultAddress" :last-updated="lastUpdated" :is-loading="isLoading" />',
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
            '<VaultsTable :vaultTransactions="vaultTransactions" :selectedVaultAddress="selectedVaultAddress" show-more-rows :last-updated="lastUpdated" />',
    }));
