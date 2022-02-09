<template>
    <span
        >{{ sign
        }}<span v-if="isValidNumber"
            ><animated-number v-if="displayFullNumber" :value="value" :decimal-places="decimals" /><span v-else
                >under 0.00001</span
            ></span
        ><span v-else-if="value"> NaN </span><span class="uppercase"> {{ currency }}</span></span
    >
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
    },
    computed: {
        displayFullNumber(): boolean {
            return this.value > 0.00001 || this.value === 0;
        },
        decimals(): number {
            if (this.displayFullNumber) {
                const decimalCutOff = Math.abs(Math.floor(Math.log10(Number(this.value)))) + 1;
                return decimalCutOff === Infinity ? 2 : decimalCutOff;
            }
            return 0;
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
            if (BigNumber.isBigNumber(this.value) && this.value.isNaN()) {
                return false;
            }
            return !(this.value === undefined || this.value === null);
        },
    },
});
</script>
