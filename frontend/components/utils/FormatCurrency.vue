<template>
    <span>
        {{ sign }}
        <template v-if="isValidNumber">
            <animated-number v-if="isAnimated" :value="value" :decimal-places="decimals" />
            <span v-else>{{ formattedNumber }}</span>
        </template>
        <span v-else>NaN</span>
        <span class="uppercase"> {{ currency }}</span>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import AnimatedNumber from '~/components/utils/AnimatedNumber.vue';

export default Vue.extend({
    name: 'FormatCurrency',
    components: { AnimatedNumber },
    props: {
        value: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: undefined,
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
        isAnimated: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        formattedNumber(): string {
            if (this.value === null) {
                return '';
            }
            return this.value.toFixed(this.decimals);
        },
        sign(): string {
            if (!this.showSign) {
                return '';
            }
            if (this.value === null) {
                return '';
            }
            return this.value > 0 ? '+' : '';
        },
        isValidNumber(): boolean {
            if (BigNumber.isBigNumber(this.value)) {
                if (this.value.toString() === 'NaN') {
                    return false;
                }
            }

            return !!this.value;
        },
    },
});
</script>
