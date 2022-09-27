<template>
    <div>
        <DashboardContainer :network="network" />
        <Footer type="unified" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import DashboardContainer from '~/containers/DashboardContainer.vue';
import Footer from '~/components/layout/Footer.vue';

export default Vue.extend({
    components: {
        DashboardContainer,
        Footer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
    computed: {
        network() {
            return this.$store.getters['network/getMakerNetwork'];
        },
    },
});
</script>
