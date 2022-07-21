<template>
    <span>{{ percentage }}%</span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'FormatPercentage',
    props: {
        value: {
            type: Number,
            required: true,
        },
    },
    computed: {
        percentage(): string {
            return (this.value * 100).toFixed(2);
        },
    },
});
</script>
