<template>
    <AuctionsContainer :network="network" />
</template>

<script lang="ts">
import Vue from 'vue';
import AuctionsContainer from '~/containers/AuctionsContainer.vue';

export default Vue.extend({
    components: {
        AuctionsContainer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
    computed: {
        network() {
            return this.$store.getters['network/getPageNetwork'];
        },
    },
});
</script>
