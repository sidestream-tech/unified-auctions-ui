<template>
    <div>
        <TermsText />
        <Footer />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TermsText from '~/components/TermsText.vue';
import Footer from '~/components/layout/Footer.vue';

export default Vue.extend({
    components: {
        TermsText,
        Footer,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
});
</script>
