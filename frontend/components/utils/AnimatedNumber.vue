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

export default Vue.extend({
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
            default: 500,
        },
        decimalPlaces: {
            type: Number,
            default: 2,
        },
    },
    methods: {
        formatValue(value: number | BigNumber): string {
            return value.toFixed(this.decimalPlaces);
        },
    },
});
</script>
