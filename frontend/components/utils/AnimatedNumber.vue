<template>
    <animated-number
        v-if="value"
        :value="value.toFixed(decimalPlaces)"
        :format-value="formatValue"
        :duration="duration"
    />
</template>
<script lang="ts">
import AnimatedNumber from 'animated-number-vue';
import Vue from 'vue';
import BigNumber from 'bignumber.js';

export default {
    components: {
        AnimatedNumber,
    },
    props: {
        value: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: undefined,
        },
        duration: {
            type: Number,
            default: 1000,
        },
        decimalPlaces: {
            type: Number,
            default: 2,
        },
    },
    methods: {
        formatValue(value) {
            return value.toFixed(this.decimalPlaces);
        },
    },
};
</script>
