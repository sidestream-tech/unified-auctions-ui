<template>
    <div>
        <Footer type="unified" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Footer from '~/components/layout/Footer.vue';

export default Vue.extend({
    components: {
        Footer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'features',
});
</script>
