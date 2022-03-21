<template>
    <div :class="isDarkMode && 'dark bg-gray-900'">
        <Header
            class="sticky top-0 z-50 w-full h-16"
            :is-explanations-shown.sync="isExplanationsShown"
            :network.sync="network"
            :dark-mode.sync="isDarkMode"
            :wallet-address="walletAddress"
            :is-wallet-loading="isWalletLoading"
            :has-accepted-terms="hasAcceptedTerms"
            :staging-banner-url="stagingBannerURL"
            :is-dev="isDev"
            @changeWalletType="changeWalletType"
            @openTermsModal="setTermsModal(true)"
        />
        <Nuxt />
        <ChangePageNetworkModal
            v-if="!isPageNetworkValid"
            :invalid-network="getPageNetwork"
            :is-dev="isDev"
            @setPageNetwork="setPageNetwork"
        />
        <ChangeWalletNetworkModal
            v-else-if="!isWalletNetworkValid"
            :invalid-network="getWalletNetworkTitle"
            :page-network="network"
            :is-dev="isDev"
            @setPageNetwork="setPageNetwork"
            @fixWalletNetwork="fixWalletNetwork"
        />
        <TermsModal :is-shown="isTermsModalShown" @accept="acceptTerms" @close="setTermsModal(false)" />
        <WalletModal :is-shown="isWalletModalShown" @connect="changeWalletType" @close="setWalletModal(false)" />
        <ManageVATModal
            :is-shown="isManageVATModalShown"
            :is-dark-mode="isDarkMode"
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
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import Header from '~/components/layout/Header.vue';
import '~/assets/styles/index';
import ChangePageNetworkModal from '~/components/modals/ChangePageNetworkModal.vue';
import ChangeWalletNetworkModal from '~/components/modals/ChangeWalletNetworkModal.vue';
import TermsModal from '~/components/modals/TermsModal.vue';
import ManageVATModal from '~/components/wallet/ManageVATModal.vue';
import WalletModal from '~/components/modals/WalletModal.vue';

export default Vue.extend({
    components: {
        ManageVATModal,
        TermsModal,
        ChangePageNetworkModal,
        ChangeWalletNetworkModal,
        Header,
        WalletModal,
    },
    computed: {
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
            isSubmitting: 'isDepositingOrWithdrawing',
        }),
        ...mapGetters('modals', {
            isTermsModalShown: 'getTermsModal',
            isWalletModalShown: 'getWalletModal',
            isManageVATModalShown: 'getManageVATModal',
        }),
        ...mapGetters('cookies', {
            hasAcceptedTerms: 'hasAcceptedTerms',
        }),
        ...mapGetters('network', [
            'getWalletNetworkTitle',
            'getPageNetwork',
            'isPageNetworkValid',
            'isWalletNetworkValid',
        ]),
        isExplanationsShown: {
            get() {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown) {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        network: {
            get() {
                return this.getPageNetwork;
            },
            set(newNetwork) {
                this.setPageNetwork(newNetwork);
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
        stagingBannerURL() {
            return process.env.STAGING_BANNER_URL;
        },
        isDev() {
            return this.$nuxt?.context?.isDev;
        },
    },
    methods: {
        ...mapActions('network', ['setPageNetwork', 'fixWalletNetwork']),
        ...mapActions('wallet', ['changeWalletType']),
        acceptTerms(): void {
            this.$store.commit('cookies/acceptTerms');
            this.$store.commit('modals/setTermsModal', false);
            this.$store.commit('modals/setWalletModal', true);
        },
        setTermsModal(open: boolean): void {
            this.$store.commit('modals/setTermsModal', open);
        },
        openWalletModalFromManageVatModal(): void {
            this.setManageVATModal(false);
            if (!this.hasAcceptedTerms) {
                this.$store.commit('modals/setTermsModal', true);
                return;
            }
            this.$store.commit('modals/setWalletModal', true);
        },
        setWalletModal(open: boolean): void {
            this.$store.commit('modals/setWalletModal', open);
        },
        setManageVATModal(open: boolean): void {
            this.$store.commit('modals/setManageVATModal', open);
        },
    },
});
</script>
