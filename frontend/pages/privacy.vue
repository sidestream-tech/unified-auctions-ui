<template>
    <div>
        <PrivacyContainer />
        <Footer />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import PrivacyContainer from '~/containers/PrivacyContainer.vue';
import Footer from '~/components/layout/Footer.vue';

export default Vue.extend({
    components: {
        PrivacyContainer,
        Footer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
});
</script>
