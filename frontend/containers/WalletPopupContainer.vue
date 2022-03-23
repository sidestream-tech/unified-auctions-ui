<template>
    <WalletModal
        :is-shown="isWalletModalShown"
        :is-dark-mode="isDarkMode"
        :is-explanations-shown="isExplanationsShown"
        token-address-d-a-i="0x6b175474e89094c44da98b954eedeac495271d0f"
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
    name: 'WalletPopupContainer',
    components: { WalletModal },
    computed: {
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
