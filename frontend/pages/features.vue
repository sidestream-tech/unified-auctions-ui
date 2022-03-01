<template>
    <div>
        <FeaturesContainer />
        <Footer />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Footer from '~/components/layout/Footer.vue';
import FeaturesContainer from '~/containers/FeaturesContainer.vue';

export default Vue.extend({
    components: {
        FeaturesContainer,
        Footer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'features',
});
</script>
