<template>
    <div>
        <VaultFlow
            :vault-transactions="vaultTransactions"
            :are-vaults-fetching="areVaultsLoading"
            :is-liquidating="isVaultBeingLiquidated"
            :selected-vault-address.sync="selectedVaultAddress"
            :is-connecting-wallet="isWalletLoading"
            :dai-vat-balance="daiVatBalance"
            :is-authorizing="isAuthorizing"
            :is-wallet-authorized="isWalletAuthorized"
            :is-withdrawing="isWithdrawing"
            :wallet-address="walletAddress"
            :is-explanations-shown.sync="isExplanationsShown"
            :is-refreshing-limits="areVaultsLoading"
            :network="network"
            @connectWallet="openSelectWalletModal"
            @disconnectWallet="disconnect"
            @refreshLimits="fetchSelectedVault"
            @liquidate="liquidate"
            @manageVat="openWalletModal"
            @authorizeWallet="authorizeWallet"
            @withdrawAllDaiFromVat="withdrawAllDaiFromVat"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { mapGetters } from 'vuex';
import VaultFlow from '~/components/vault/VaultFlow.vue';

export default Vue.extend({
    components: {
        VaultFlow,
    },
    props: {
        network: {
            type: String,
            default: 'mainnet',
        },
    },
    computed: {
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
            isWithdrawing: 'isDepositingOrWithdrawing',
        }),
        ...mapGetters('authorizations', {
            isAuthorizing: 'isWalletAuthorizationLoading',
            isWalletAuthorized: 'isWalletAuthorizationDone',
        }),
        daiVatBalance(): BigNumber | undefined {
            return this.walletBalances?.walletVatDAI;
        },
        ...mapGetters('vaults', {
            vaultTransactions: 'listVaultTransactions',
            vaultErrors: 'getVaultErrors',
            areVaultsLoading: 'areVaultsLoading',
            isVaultBeingLiquidated: 'isVaultBeingLiquidated',
            isLiquidated: 'isVaultLiquidationDone',
            lastUpdated: 'getLastUpdated',
        }),
        selectedVaultAddress: {
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
        selectedVaultAddress: {
            immediate: true,
            handler(): void {
                this.fetchSelectedVault();
            },
        },
        walletAddress(): void {
            this.fetchRelatedData();
        },
        isLiquidated(): void {
            this.fetchRelatedData();
        },
    },
    methods: {
        fetchSelectedVault(): void {
            this.$store.dispatch('vaults/updateSelectedVault');
        },
        liquidate(walletAddress: string): void {
            this.$store.dispatch('vaults/liquidateVault', {
                vaultAddress: this.selectedVaultAddress,
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
        authorizeWallet() {
            this.$store.dispatch('authorizations/authorizeWallet');
        },
        withdrawAllDaiFromVat() {
            this.$store.dispatch('wallet/withdrawFromVAT', this.daiVatBalance);
        },
    },
});
</script>
