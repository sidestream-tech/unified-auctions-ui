<template>
    <ManageVATModal
        :is-shown="isManageVATModalShown"
        :is-dark-mode="isDarkMode"
        :is-explanations-shown="isExplanationsShown"
        token-address-d-a-i="0x6b175474e89094c44da98b954eedeac495271d0f"
        :max-deposit="walletBalances ? walletBalances.walletDAI : undefined"
        :max-withdraw="walletBalances ? walletBalances.walletVatDAI : undefined"
        :wallet-address="walletAddress"
        :wallet-e-t-h="walletBalances ? walletBalances.walletETH : undefined"
        :wallet-vat-d-a-i="walletBalances ? walletBalances.walletVatDAI : undefined"
        :wallet-d-a-i="walletBalances ? walletBalances.walletDAI : undefined"
        :is-submitting="isSubmitting"
        :is-wallet-loading="isWalletLoading"
        :is-depositing-allowed="false"
        :is-withdrawing-allowed="false"
        @cancel="setManageVATModal(false)"
        @connectWallet="openWalletModalFromManageVatModal()"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import ManageVATModal from '~/components/wallet/ManageVATModal.vue';

export default Vue.extend({
    name: 'WalletPopupContainer',
    components: { ManageVATModal },
    computed: {
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
            isSubmitting: 'isDepositingOrWithdrawing',
        }),
        ...mapGetters('modals', {
            isManageVATModalShown: 'getManageVATModal',
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
        openWalletModalFromManageVatModal(): void {
            this.setManageVATModal(false);
            if (!this.hasAcceptedTerms) {
                this.$store.commit('modals/setTermsModal', true);
                return;
            }
            this.$store.commit('modals/setWalletModal', true);
        },
        setManageVATModal(open: boolean): void {
            this.$store.commit('modals/setManageVATModal', open);
        },
    },
});
</script>
