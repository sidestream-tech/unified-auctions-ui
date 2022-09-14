import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import VaultsText from './VaultsText.vue';
import { generateFakeVaultTransactions } from '~/helpers/generateFakeVault.ts';

const fakeVaults = generateFakeVaultTransactions();
const randomSelectedVault = faker.random.arrayElement(fakeVaults);

const common = {
    components: { VaultsText },
    data: () => ({
        vaultTransactions: fakeVaults,
        selectedVaultId: randomSelectedVault.id.toString(),
    }),
};

storiesOf('Vault/VaultsText', module)
    .add('Plain', () => ({
        ...common,
        template: '<VaultsText :vaultTransactions="vaultTransactions" :selectedVaultId="selectedVaultId" />',
    }))
    .add('Fetching with Auctions', () => ({
        ...common,
        template:
            '<VaultsText :vaultTransactions="vaultTransactions" :selectedVaultId="selectedVaultId" :isVaultsLoading="true" />',
    }))
    .add('Fetching without Auctions', () => ({
        ...common,
        template: '<VaultsText :isVaultsLoading="true" />',
    }))
    .add('Error', () => ({
        ...common,
        template: '<VaultsText vaultsError="There was an error fetching the Vaults." />',
    }))
    .add('Expert Mode', () => ({
        ...common,
        template:
            '<VaultsText :vaultTransactions="vaultTransactions" :selectedVaultId="selectedVaultId" :isExplanationsShown="false" />',
    }))
    .add('No props', () => ({
        ...common,
        template: '<VaultsText />',
    }));
