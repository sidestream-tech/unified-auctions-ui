<template>
    <AuctionsFakeData v-if="isPageNetworkFake" />
    <AuctionsContainer v-else :network="network" />
</template>

<script lang="ts">
import Vue from 'vue';
import AuctionsFakeData from '~/containers/AuctionsFakeData.vue';
import AuctionsContainer from '~/containers/AuctionsContainer.vue';

export default Vue.extend({
    components: {
        AuctionsFakeData,
        AuctionsContainer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
    computed: {
        isPageNetworkFake() {
            return this.$store.getters['network/isPageNetworkFake'];
        },
        network() {
            return this.$store.getters['network/getPageNetwork'];
        },
    },
});
</script>
