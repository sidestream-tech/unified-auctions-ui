<template>
    <AuctionsFakeData v-if="!network" />
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
        network() {
            return this.$store.getters['preferences/getNetwork'];
        },
    },
});
</script>
