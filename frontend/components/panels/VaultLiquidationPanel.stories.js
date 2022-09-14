import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import VaultLiquidationPanel from './VaultLiquidationPanel';
import {
    generateFakeVaultLiquidatedTransaction,
    generateFakeVaultNotLiquidatedTransaction,
} from '~/helpers/generateFakeVault';

const vaultTransaction = generateFakeVaultNotLiquidatedTransaction();

const common = {
    components: { VaultLiquidationPanel },
    data() {
        return {
            vaultTransaction,
            walletAddress: faker.finance.ethereumAddress(),
        };
    },
    methods: {
        liquidate: action('liquidate'),
    },
    template: '<VaultLiquidationPanel v-bind="$data" @liquidate="liquidate" />',
};

storiesOf('Panels/VaultLiquidationPanel', module)
    .add('Default', () => ({
        ...common,
    }))
    .add('Expert Mode', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isExplanationsShown: false,
            };
        },
    }))
    .add('Disabled', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                disabled: true,
            };
        },
    }))
    .add('Not Liquidatable', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransaction: {
                    ...vaultTransaction,
                    state: 'not-liquidatable',
                },
            };
        },
    }))
    .add('Liquidated', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultTransaction: generateFakeVaultLiquidatedTransaction(),
            };
        },
    }));
