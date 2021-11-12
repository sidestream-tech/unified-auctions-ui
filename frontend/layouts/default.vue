<template>
    <div :class="isDarkMode && 'dark bg-dark'">
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
        <ForceNetworkModal :is-invalid-network="isInvalidNetwork" :chain-id="chainID" @updateNetwork="changeNetwork" />
        <TermsModal :is-shown="isTermsModalShown" @accept="acceptTerms" @close="setTermsModal(false)" />
        <WalletModal :is-shown="isWalletModalShown" @connect="changeWalletType" @close="setWalletModal(false)" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import Header from '~/components/layout/Header.vue';
import '~/assets/styles/index';
import ForceNetworkModal from '~/components/ForceNetworkModal.vue';
import TermsModal from '~/components/TermsModal.vue';
import WalletModal from '~/components/utils/WalletModal.vue';

export default Vue.extend({
    components: {
        TermsModal,
        ForceNetworkModal,
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
            isInvalidNetwork: 'getIsInvalidNetwork',
            chainID: 'getChainID',
            hasAcceptedTerms: 'getAcceptedTerms',
        }),
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
                return this.$store.getters['preferences/getNetwork'];
            },
            set(newNetwork) {
                this.$store.dispatch('preferences/setNetwork', newNetwork);
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
        changeWalletType(walletType: string): void {
            this.$store.dispatch('wallet/changeWalletType', walletType);
        },
        changeNetwork(newNetwork: string): void {
            this.$store.dispatch('preferences/setNetwork', newNetwork);
        },
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
