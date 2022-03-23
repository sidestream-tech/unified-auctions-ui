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
        @cancel="setWalletModal(false)"
        @refresh="refresh()"
        @connectWallet="openSelectWalletModal()"
        @deposit="depositToVAT"
        @withdraw="withdrawFromVAT"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
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
        }),
        ...mapGetters('modals', {
            isWalletModalShown: 'getWalletModal',
        }),
        ...mapGetters('authorizations', {
            isWalletAuthorizationDone: 'isWalletAuthorizationDone',
            allowanceAmount: 'allowanceAmount',
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
        refresh(): void {
            this.$store.dispatch('wallet/fetchWalletBalances');
        },
        depositToVAT(amount: BigNumber) {
            this.$store.dispatch('wallet/depositToVAT', amount);
        },
        withdrawFromVAT(amount: BigNumber) {
            this.$store.dispatch('wallet/withdrawFromVAT', amount);
        },
    },
});
</script>
