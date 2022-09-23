<template>
    <span><AnimatedNumber :value="percentage" />%</span>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import AnimatedNumber from '~/components/common/formatters/AnimatedNumber.vue';

export default Vue.extend({
    name: 'FormatPercentage',
    components: {
        AnimatedNumber,
    },
    props: {
        value: {
            type: [Number, String, Object] as Vue.PropType<number | BigNumber>,
            required: true,
        },
    },
    computed: {
        percentage(): number | BigNumber {
            if (BigNumber.isBigNumber(this.value)) {
                return this.value.multipliedBy(100);
            }
            return this.value * 100;
        },
    },
});
</script>
