<template>
    <HomeBackground>
        <UnifiedContainer class="flex-grow" />
        <Footer type="unified" />
    </HomeBackground>
</template>

<script lang="ts">
import Vue from 'vue';
import UnifiedContainer from '~/containers/UnifiedContainer.vue';
import Footer from '~/components/layout/Footer.vue';
import HomeBackground from '~/components/layout/HomeBackground.vue';

export default Vue.extend({
    components: {
        UnifiedContainer,
        Footer,
        HomeBackground,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
});
</script>
