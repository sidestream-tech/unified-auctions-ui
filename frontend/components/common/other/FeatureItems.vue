<template>
    <ul class="list-disc list-inside text-gray-700 dark:text-gray-200">
        <li v-if="text">{{ text }}</li>
        <feature-items v-for="(item, index) in items" :key="index" :items="item.items" :text="item.text" />
    </ul>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'FeatureItems',
    props: {
        text: {
            type: String,
            default: '',
        },
        items: {
            type: Array as Vue.PropType<FeatureItem[]>,
            default: () => [],
        },
    },
});
</script>
