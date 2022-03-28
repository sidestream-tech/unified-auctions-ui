<template>
    <WalletModal
        :network="network"
        :is-shown="isWalletModalShown"
        :is-dark-mode="isDarkMode"
        :is-explanations-shown="isExplanationsShown"
        :wallet-address="walletAddress"
        :wallet-balances="walletBalances"
        :allowance-amount="allowanceAmount"
        :is-withdrawing-allowed="isWalletAuthorizationDone"
        :is-submitting="isDepositingOrWithdrawing"
        :is-wallet-loading="isFetchingBalances"
        :is-loading="isFetchingBalances"
        :is-allowance-amount-loading="isAllowanceAmountLoading"
        @cancel="setWalletModal(false)"
        @refresh="refresh()"
        @connectWallet="openSelectWalletModal()"
        @deposit="depositToVAT"
        @withdraw="withdrawFromVAT"
        @grantAccess="grantAccess"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import WalletModal from '../components/wallet/WalletModal.vue';

export default Vue.extend({
    name: 'WalletModalContainer',
    components: { WalletModal },
    computed: {
        ...mapGetters('network', {
            network: 'getMakerNetwork',
        }),
        ...mapGetters('wallet', {
            isFetchingBalances: 'isFetchingBalances',
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
            isDepositingOrWithdrawing: 'isDepositingOrWithdrawing',
            isConnecting: 'isLoading',
            isConnected: 'isConnected',
        }),
        ...mapGetters('modals', {
            isWalletModalShown: 'getWalletModal',
        }),
        ...mapGetters('authorizations', {
            isWalletAuthorizationDone: 'isWalletAuthorizationDone',
            allowanceAmount: 'allowanceAmount',
            isAllowanceAmountLoading: 'isAllowanceAmountLoading',
        }),
        ...mapGetters('cookies', {
            hasAcceptedTerms: 'hasAcceptedTerms',
        }),
        isExplanationsShown: {
            get() {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown) {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        isDarkMode: {
            get(): Boolean {
                return this.$store.getters['preferences/getIsDarkMode'];
            },
            set(newIsDarkMode) {
                this.$store.dispatch('preferences/setIsDarkMode', newIsDarkMode);
            },
        },
    },
    watch: {
        isWalletModalShown: {
            immediate: true,
            handler(isWalletModalShown: boolean) {
                if (!isWalletModalShown || !this.walletAddress) {
                    return;
                }
                this.$store.dispatch('wallet/fetchWalletBalances');
                this.$store.dispatch('authorizations/fetchAllowanceAmount');
            },
        },
        walletAddress: {
            handler(walletAddress: string | undefined) {
                if (!this.isWalletModalShown || !walletAddress) {
                    return;
                }
                this.$store.dispatch('wallet/fetchWalletBalances');
                this.$store.dispatch('authorizations/fetchAllowanceAmount');
            },
        },
    },
    methods: {
        ...mapActions('wallet', {
            refresh: 'fetchWalletBalances',
            depositToVAT: 'depositToVAT',
            withdrawFromVAT: 'withdrawFromVAT',
        }),
        openSelectWalletModal(): void {
            this.setWalletModal(false);
            if (!this.hasAcceptedTerms) {
                this.$store.commit('modals/setTermsModal', true);
                return;
            }
            this.$store.commit('modals/setSelectWalletModal', true);
        },
        setWalletModal(open: boolean): void {
            this.$store.commit('modals/setWalletModal', open);
        },
        grantAccess(): void {
            this.$store.dispatch('authorizations/setAllowanceAmount');
        },
    },
});
</script>
