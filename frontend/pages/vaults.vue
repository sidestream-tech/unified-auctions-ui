<template>
    <VaultsContainer :network="network" />
</template>

<script lang="ts">
import Vue from 'vue';
import VaultsContainer from '../containers/VaultsContainer.vue';

export default Vue.extend({
    components: {
        VaultsContainer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
    computed: {
        network() {
            return this.$store.getters['network/getPageNetwork'];
        },
    },
});
</script>
