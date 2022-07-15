<template>
    <div>
        <UnifiedContainer />
        <Footer type="unified" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UnifiedContainer from '~/containers/UnifiedContainer.vue';
import Footer from '~/components/layout/Footer.vue';

export default Vue.extend({
    components: {
        UnifiedContainer,
        Footer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
});
</script>
