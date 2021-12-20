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
            @changeWalletType="changeWalletType"
            @openTermsModal="setTermsModal(true)"
        />
        <Nuxt />
        <ChangePageNetworkModal
            v-if="!isPageNetworkValid"
            :invalid-network="getPageNetwork"
            @setPageNetwork="setPageNetwork"
        />
        <ChangeWalletNetworkModal
            v-else-if="!isWalletNetworkValid"
            :invalid-network="getWalletNetworkTitle"
            :page-network="network"
            @setPageNetwork="setPageNetwork"
            @fixWalletNetwork="fixWalletNetwork"
        />
        <TermsModal :is-shown="isTermsModalShown" @accept="acceptTerms" @close="setTermsModal(false)" />
        <WalletModal :is-shown="isWalletModalShown" @connect="changeWalletType" @close="setWalletModal(false)" />
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
import WalletModal from '~/components/modals/WalletModal.vue';

export default Vue.extend({
    components: {
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
        }),
        ...mapGetters('modals', {
            isTermsModalShown: 'getTermsModal',
            isWalletModalShown: 'getWalletModal',
        }),
        ...mapGetters('preferences', {
            hasAcceptedTerms: 'getAcceptedTerms',
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
    },
    methods: {
        ...mapActions('network', ['setPageNetwork', 'fixWalletNetwork']),
        ...mapActions('wallet', ['changeWalletType']),
        acceptTerms(): void {
            this.$store.commit('preferences/setAcceptedTerms', true);
            this.$store.commit('modals/setTermsModal', false);
            this.$store.commit('modals/setWalletModal', true);
        },
        setTermsModal(open: boolean): void {
            this.$store.commit('modals/setTermsModal', open);
        },
        setWalletModal(open: boolean): void {
            this.$store.commit('modals/setWalletModal', open);
        },
    },
});
</script>
