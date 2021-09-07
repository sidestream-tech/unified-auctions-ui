<template>
    <div>
        <Header class="sticky top-0 z-50 w-full h-16" />
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
