<template>
    <div :class="isDarkMode && 'dark bg-dark'">
        <Header
            class="sticky top-0 z-50 w-full h-16"
            :is-explanations-shown.sync="isExplanationsShown"
            :network.sync="network"
            :dark-mode.sync="isDarkMode"
            :wallet-address="walletAddress"
            :is-wallet-loading="isWalletLoading"
            @changeWalletType="changeWalletType"
        />
        <Nuxt />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import Header from '~/components/layout/Header.vue';

export default Vue.extend({
    components: {
        Header,
    },
    computed: {
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
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
    },
});
</script>
