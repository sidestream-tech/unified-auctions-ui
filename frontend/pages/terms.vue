<template>
    <TermsText />
</template>

<script lang="ts">
import Vue from 'vue';
import TermsText from '~/components/TermsText.vue';

export default Vue.extend({
    components: {
        TermsText,
    },
    layout: process.env.DEMO_MODE ? 'demoMode' : 'default',
});
</script>
