<template>
    <span>
        <span v-if="isNotANumber">Unknown</span>
        <span v-else
            >{{ sign
            }}<animated-number
                :value="value"
                :decimal-places="decimalPlaces"
                :disable-thousand-separators="disableThousandSeparators"
            />
        </span>
        <span class="uppercase">{{ currency }}</span>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import AnimatedNumber from '~/components/common/formatters/AnimatedNumber.vue';

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
        decimalPlaces: {
            type: Number as Vue.PropType<Number>,
            default: 2,
        },
        disableThousandSeparators: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        sign(): string {
            if (!this.showSign) {
                return '';
            }
            if (this.value === null) {
                return '';
            }
            return this.value > 0 ? '+' : '';
        },
        isNotANumber(): boolean {
            if (BigNumber.isBigNumber(this.value) && this.value.isNaN()) {
                return true;
            }
            return Number.isNaN(this.value);
        },
    },
});
</script>
