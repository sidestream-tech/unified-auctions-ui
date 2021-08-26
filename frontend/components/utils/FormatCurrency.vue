<template>
    <span>
        {{ fixedNumber }}<span class="uppercase"> {{ currency }} </span>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'FormatCurrency',
    props: {
        value: {
            type: Number,
            default: null,
        },
        currency: {
            type: String,
            default: '',
        },
    },
    computed: {
        fixedNumber(): string {
            if (this.value) {
                return this.value.toFixed(2);
            }
            return '';
        },
    },
});
</script>
