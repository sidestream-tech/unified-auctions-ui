<template>
    <div :class="isDarkMode && 'dark bg-gray-900'">
        <Header
            class="sticky top-0 z-50 w-full h-fit"
            :is-explanations-shown.sync="isExplanationsShown"
            :type="headerType"
            :page-name="pageName"
            :network.sync="network"
            :dark-mode.sync="isDarkMode"
            :wallet-address="walletAddress"
            :is-wallet-loading="isWalletLoading"
            :has-accepted-terms="hasAcceptedTerms"
            :staging-banner-url="stagingBannerURL"
            :networks="networks"
            :is-changing-network="isChangingNetwork"
            @changeWalletType="changeWalletType"
            @changeRpcUrl="isRpcUrlConfigurationModalShown = true"
            @openTermsModal="setTermsModal(true)"
            @openWalletModal="openWalletModal"
            @openManageCollateralModal="openManageCollateralModal"
        />
        <Nuxt />
        <RpcUrlConfigurationModal
            v-if="!getRpcUrl || isRpcUrlConfigurationModalShown"
            :is-shown.sync="isRpcUrlConfigurationModalShown"
            :current-rpc-url="getRpcUrl"
            :is-changing-network="isChangingNetwork"
            @configureRpcUrl="configureRpcUrl"
        />
        <ChangePageNetworkModal
            v-else-if="!isPageNetworkValid && !isChangingNetwork"
            :invalid-network="getPageNetwork"
            :networks="networks"
            @setPageNetwork="setPageNetwork"
        />
        <ChangeWalletNetworkModal
            v-else-if="!isWalletNetworkValid && !isChangingNetwork"
            :invalid-network="getWalletNetworkTitle"
            :page-network="network"
            :networks="networks"
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
        <ManageCollateralModalContainer />
        <Analytics />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import Header from '~/components/layout/Header.vue';
import '~/assets/styles/index';
import RpcUrlConfigurationModal from '~/components/modals/RpcUrlConfigurationModal.vue';
import ChangePageNetworkModal from '~/components/modals/ChangePageNetworkModal.vue';
import ChangeWalletNetworkModal from '~/components/modals/ChangeWalletNetworkModal.vue';
import WalletSelectModal from '~/components/modals/WalletSelectModal.vue';
import WalletModalContainer from '~/containers/WalletModalContainer.vue';
import ManageCollateralModalContainer from '~/containers/ManageCollateralModalContainer.vue';
import TermsModal from '~/components/modals/TermsModal.vue';
import Analytics from '~/components/common/other/Analytics.vue';

export default Vue.extend({
    components: {
        RpcUrlConfigurationModal,
        WalletModalContainer,
        TermsModal,
        ChangePageNetworkModal,
        ChangeWalletNetworkModal,
        Header,
        WalletSelectModal,
        ManageCollateralModalContainer,
        Analytics,
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
        ...mapGetters('preferences', ['getRpcUrl']),
        ...mapGetters('network', [
            'networks',
            'getWalletNetworkTitle',
            'getPageNetwork',
            'getMakerNetwork',
            'isPageNetworkValid',
            'isWalletNetworkValid',
            'isChangingNetwork',
        ]),
        isExplanationsShown: {
            get() {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown) {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        isDarkMode: {
            get() {
                return this.$store.getters['preferences/getIsDarkMode'];
            },
            set(newIsDarkMode) {
                this.$store.dispatch('preferences/setIsDarkMode', newIsDarkMode);
            },
        },
        isRpcUrlConfigurationModalShown: {
            get() {
                return this.$store.getters['modals/getRpcUrlConfigurationModal'];
            },
            set(newIsShown) {
                this.$store.commit('modals/setRpcUrlConfigurationModal', newIsShown);
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
        stagingBannerURL() {
            return process.env.STAGING_BANNER_URL;
        },
        pageName(): string {
            return this.$route?.name || '';
        },
        headerType(): string {
            return (
                {
                    collateral: 'auctions',
                    surplus: 'auctions',
                    privacy: 'minimal',
                    index: 'unified',
                }[this.pageName] ?? 'default'
            );
        },
    },
    watch: {
        getMakerNetwork(newValue) {
            if (newValue) {
                this.$store.dispatch('network/setup');
            }
        },
    },
    methods: {
        ...mapActions('network', ['configureRpcUrl', 'setPageNetwork', 'fixWalletNetwork']),
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
        openManageCollateralModal(): void {
            this.$store.commit('modals/setManageCollateralModal', true);
        },
        setSelectWalletModal(open: boolean): void {
            this.$store.commit('modals/setSelectWalletModal', open);
        },
    },
});
</script>
