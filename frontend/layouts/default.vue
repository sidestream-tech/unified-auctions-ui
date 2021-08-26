<template>
    <div>
        <Header />
        <Nuxt />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Header from '~/components/layout/Header.vue';

export default Vue.extend({
    components: {
        Header,
    },
});
</script>
