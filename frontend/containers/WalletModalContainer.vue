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
        :token-address-dai="tokenAddressDai"
        @cancel="setWalletModal(false)"
        @refresh="fetchRelatedData()"
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
            tokenAddressDai: 'tokenAddressDai',
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
            handler() {
                this.fetchRelatedData();
            },
        },
        walletAddress: {
            handler() {
                this.fetchRelatedData();
            },
        },
    },
    methods: {
        ...mapActions('wallet', {
            depositToVAT: 'depositToVAT',
            withdrawFromVAT: 'withdrawFromVAT',
        }),
        openSelectWalletModal(): void {
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
        fetchRelatedData(): void {
            this.$store.dispatch('wallet/fetchWalletBalances');
            this.$store.dispatch('wallet/fetchTokenAddressDai');
            this.$store.dispatch('authorizations/fetchAllowanceAmount');
            this.$store.dispatch('authorizations/fetchWalletAuthorizationStatus');
        },
    },
});
</script>
