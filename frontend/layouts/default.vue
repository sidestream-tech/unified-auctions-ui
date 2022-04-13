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
            @openWalletModal="openWalletModal"
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
        <WalletSelectModal
            :is-shown="isSelectWalletModalShown"
            @connect="changeWalletType"
            @close="setSelectWalletModal(false)"
        />
        <WalletModalContainer />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import Header from '~/components/layout/Header.vue';
import '~/assets/styles/index';
import ChangePageNetworkModal from '~/components/modals/ChangePageNetworkModal.vue';
import ChangeWalletNetworkModal from '~/components/modals/ChangeWalletNetworkModal.vue';
import WalletSelectModal from '~/components/modals/WalletSelectModal.vue';
import WalletModalContainer from '~/containers/WalletModalContainer.vue';
import TermsModal from '~/components/modals/TermsModal.vue';

export default Vue.extend({
    components: {
        WalletModalContainer,
        TermsModal,
        ChangePageNetworkModal,
        ChangeWalletNetworkModal,
        Header,
        WalletSelectModal,
    },
    computed: {
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
        }),
        ...mapGetters('modals', {
            isTermsModalShown: 'getTermsModal',
            isSelectWalletModalShown: 'getSelectWalletModal',
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
            this.$store.commit('modals/setSelectWalletModal', true);
        },
        setTermsModal(open: boolean): void {
            this.$store.commit('modals/setTermsModal', open);
        },
        openWalletModal(): void {
            this.$store.commit('modals/setWalletModal', true);
        },
        setSelectWalletModal(open: boolean): void {
            this.$store.commit('modals/setSelectWalletModal', open);
        },
    },
});
</script>
