<template>
    <span>
        {{ sign }}{{ fixedNumber }}<span class="uppercase"> {{ currency }} </span>
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
        showSign: {
            type: Boolean,
            default: false,
        },
        decimals: {
            type: Number,
            default: 2,
        },
    },
    computed: {
        fixedNumber(): string {
            if (this.value) {
                return this.value.toFixed(this.decimals);
            }
            return '';
        },
        sign(): string {
            if (!this.showSign) {
                return '';
            }
            return this.value > 0 ? '+' : '';
        },
    },
});
</script>
