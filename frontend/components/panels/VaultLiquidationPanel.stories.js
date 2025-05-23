import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import VaultLiquidationPanel from './VaultLiquidationPanel';
import { generateFakeVaultNotLiquidatedTransaction } from '~/helpers/generateFakeVault';

const vaultTransaction = generateFakeVaultNotLiquidatedTransaction();

const common = {
    components: { VaultLiquidationPanel },
    data() {
        return {
            vaultAddress: vaultTransaction.address,
            vaultState: vaultTransaction.state,
            network: vaultTransaction.network,
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
                vaultState: 'not-liquidatable',
            };
        },
    }))
    .add('Liquidating', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                isLiquidating: true,
            };
        },
    }))
    .add('Liquidated', () => ({
        ...common,
        data() {
            return {
                ...common.data(),
                vaultState: 'liquidated',
            };
        },
    }));
