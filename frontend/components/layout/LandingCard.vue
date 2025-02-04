<template>
    <div class="w-full max-w-7xl px-5 md:px-16 mx-auto">
        <slot />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'LandingCard',
});
</script>
