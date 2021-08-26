<template>
    <span :title="value"> {{ formattedAddress }} </span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'FormatAddress',
    props: {
        value: {
            type: String,
            default: null,
        },
    },
    computed: {
        formattedAddress(): string {
            if (!this.value) {
                return '';
            }
            const firstHalf = this.value.substr(0, 7);
            const secondHalf = this.value.substr(this.value.length - 4);
            return `${firstHalf}...${secondHalf}`;
        },
    },
});
</script>
