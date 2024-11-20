<template>
    <div>
        <SplitLayout :step.sync="step">
            <template #step0>
                <div v-if="isExplanationsShown" class="h-1/2">
                    <LandingBlock title="Vault liquidation" @explanations="explanationsTrigger" />
                </div>
                <div class="mx-4 md:mx-0 MainTextContainer">
                    <VaultsText :is-explanations-shown="isExplanationsShown" :network="network" />
                </div>
            </template>
            <template #step1>
                <div>
                    <Vault
                        v-if="selectedVaultAddress"
                        class="mt-6 mb-8 mx-8"
                        :vault-address="selectedVaultAddress"
                        :vault-transaction="selectedVaultTransaction"
                        :error="vaultsError"
                        :are-vaults-fetching="areVaultsFetching"
                        :is-explanations-shown="isExplanationsShown"
                        @participate="participate"
                    />
                </div>
            </template>
            <template #step2>
                <VaultLiquidationTransactionFlow
                    v-if="selectedVaultTransaction"
                    class="mt-6 mb-8 mx-8"
                    :vault-transaction="selectedVaultTransaction"
                    :wallet-address="walletAddress"
                    :is-connecting-wallet="isConnectingWallet"
                    :dai-vat-balance="daiVatBalance"
                    :is-authorizing="isAuthorizing"
                    :is-wallet-authorized="isWalletAuthorized"
                    :is-withdrawing="isWithdrawing"
                    :is-refreshing-limits="isRefreshingLimits"
                    :is-liquidating="isLiquidating"
                    :is-explanations-shown="isExplanationsShown"
                    @connectWallet="$emit('connectWallet')"
                    @disconnectWallet="$emit('disconnectWallet')"
                    @refreshLimits="$emit('refreshLimits')"
                    @liquidate="$emit('liquidate', $event)"
                    @manageVat="$emit('manageVat')"
                    @authorizeWallet="$emit('authorizeWallet')"
                    @withdrawAllDaiFromVat="$emit('withdrawAllDaiFromVat')"
                />
            </template>
        </SplitLayout>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { VaultTransaction } from 'auctions-core/src/types';
import VaultsText from './VaultsText.vue';
import Vault from './Vault.vue';
import VaultLiquidationTransactionFlow from './VaultLiquidationTransactionFlow.vue';
import SplitLayout from '~/components/layout/SplitLayout.vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';

export default Vue.extend({
    components: {
        VaultLiquidationTransactionFlow,
        Vault,
        VaultsText,
        SplitLayout,
        LandingBlock,
    },
    props: {
        vaultTransactions: {
            type: Array as Vue.PropType<VaultTransaction[]>,
            default: () => [],
        },
        areVaultsFetching: {
            type: Boolean,
            default: false,
        },
        vaultsError: {
            type: String,
            default: null,
        },
        selectedVaultAddress: {
            type: String,
            default: null,
        },
        isConnectingWallet: {
            type: Boolean,
            default: false,
        },
        daiVatBalance: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        isWithdrawing: {
            type: Boolean,
            default: false,
        },
        isRefreshingLimits: {
            type: Boolean,
            default: false,
        },
        isLiquidating: {
            type: Boolean,
            default: false,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        lastUpdated: {
            type: Date,
            default: null,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
    },
    data: () => ({
        step: 0,
    }),
    computed: {
        selectedVaultTransaction(): VaultTransaction | null {
            return (
                this.vaultTransactions.find(
                    vaultTransaction => vaultTransaction.address.toString() === this.selectedVaultAddress
                ) || null
            );
        },
    },
    watch: {
        selectedVaultAddress: {
            immediate: true,
            handler(newSelectedVaultAddress) {
                if (!newSelectedVaultAddress) {
                    this.step = 0;
                } else {
                    this.step = 1;
                }
            },
        },
        step: {
            immediate: true,
            handler(newStep) {
                if (newStep === 0) {
                    this.$emit('update:selectedVaultAddress', null);
                }
            },
        },
    },
    methods: {
        explanationsTrigger(event: boolean): void {
            if (event === true && this.$refs.mainText) {
                (this.$refs.mainText as Vue).$el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
            this.$emit('update:isExplanationsShown', event);
        },
        participate() {
            this.step = 2;
        },
    },
});
</script>

<style scoped>
.MainTextContainer {
    min-height: calc(100vh - 10rem);
}
</style>
