<template>
    <div>
        <div v-if="title" class="text-xl font-extrabold mb-4 text-gray-700">{{ title }}</div>
        <slot />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    props: {
        title: {
            type: String,
            default: '',
        },
    },
});
</script>
