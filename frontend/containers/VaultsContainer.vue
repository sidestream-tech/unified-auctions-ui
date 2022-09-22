<template>
    <div>
        <VaultFlow
            :vault-transactions="Object.values(vaultTransactions)"
            :are-vaults-fetching="areVaultsLoading"
            :is-liquidating="isVaultBeingLiquidated"
            :selected-vault-id="selectedVaultId"
            :is-connecting-wallet="isWalletLoading"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            :is-refreshing-limits="false"
            @connectWallet="openSelectWalletModal"
            @disconnectWallet="disconnect"
            @liquidate="liquidate"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import VaultFlow from '~/components/vault/VaultFlow.vue';

export default Vue.extend({
    components: {
        VaultFlow,
    },
    computed: {
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
        }),
        ...mapGetters('vaults', {
            vaultTransactions: 'vaultTransactions',
            areVaultsLoading: 'isVaultLoading',
            isVaultBeingLiquidated: 'isVaultBeingLiquidated',
        }),
        selectedVaultId: {
            get(): string | null {
                const vaultsGetParameter = this.$route.query.vault;
                if (Array.isArray(vaultsGetParameter)) {
                    return vaultsGetParameter[0];
                } else {
                    return vaultsGetParameter;
                }
            },
            set(newVaultId: string): void {
                if (!newVaultId) {
                    const network = this.$route.query.network;
                    this.$router.push({ query: { network } });
                }
            },
        },
        isExplanationsShown: {
            get(): boolean {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown): void {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        hasAcceptedTerms(): boolean {
            return this.$store.getters['cookies/hasAcceptedTerms'];
        },
    },
    watch: {
        selectedVaultId: {
            immediate: true,
            handler(vaultId): void {
                if (vaultId) {
                    this.$store.dispatch('vaults/fetchVault', vaultId);
                }
                this.fetchRelatedData();
            },
        },
        walletAddress(): void {
            this.fetchRelatedData();
        },
    },
    methods: {
        liquidate(walletAddress: string): void {
            this.$store.dispatch('vaults/liquidateVault', {
                vaultId: this.selectedVaultId,
                walletAddress,
            });
        },
        openSelectWalletModal(): void {
            if (!this.hasAcceptedTerms) {
                this.$store.commit('modals/setTermsModal', true);
                return;
            }
            this.$store.commit('modals/setSelectWalletModal', true);
        },
        openWalletModal(): void {
            this.$store.commit('modals/setWalletModal', true);
        },
        disconnect(): void {
            this.$store.dispatch('wallet/disconnect');
        },
        fetchRelatedData(): void {
            if (!this.walletAddress) {
                return;
            }
            this.$store.dispatch('wallet/setup');
        },
    },
});
</script>
