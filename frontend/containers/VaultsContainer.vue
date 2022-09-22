<template>
    <div>
        <VaultFlow
            :vault-transactions="[]"
            :liquidation-limits="undefined"
            :are-vaults-fetching="false"
            :vaults-error="undefined"
            :is-refreshing-limits="false"
            :is-liquidating="false"
            :last-updated="undefined"
            :selected-vault-id="selectedVaultId"
            :is-connecting-wallet="isWalletLoading"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="openSelectWalletModal"
            @disconnectWallet="disconnect"
            @refreshLimits="refreshLimits"
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
            walletBalances: 'walletBalances',
            isDepositingOrWithdrawing: 'isDepositingOrWithdrawing',
            isFetchingCollateralVatBalance: 'isFetchingCollateralVatBalance',
            collateralVatBalanceStore: 'collateralVatBalanceStore',
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
            handler(): void {
                // fetch vault with new ID
                this.fetchRelatedData();
            },
        },
        walletAddress(): void {
            this.fetchRelatedData();
        },
    },
    methods: {
        liquidate(walletAddress): void {
            console.info(`Liquidating ${this.selectedVaultId} with wallet ${walletAddress}`);
        },
        refreshLimits(): void {},
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
