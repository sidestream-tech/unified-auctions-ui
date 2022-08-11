<template>
    <DebtContainer :network="network" />
</template>

<script lang="ts">
import Vue from 'vue';
import DebtContainer from '~/containers/DebtContainer.vue';

export default Vue.extend({
    components: {
        DebtContainer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
    computed: {
        network() {
            return this.$store.getters['network/getPageNetwork'];
        },
    },
});
</script>
