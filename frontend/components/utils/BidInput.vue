<template>
    <div class="w-full inline-block relative flex-shrink-0">
        <Tooltip :visible="!!error" placement="topLeft" :title="error">
            <label>
                <div v-if="!amountToBid" class="absolute text-right right-8 top-1">
                    <format-currency v-if="totalPrice && !disabled" :value="totalPrice" />
                    <span v-else class="opacity-50">UNKNOWN</span>
                </div>
                <span class="absolute right-1 top-1">DAI</span>
                <input
                    v-model="amountToBidInput"
                    class="Input"
                    :class="{ Error: error, Inactive: disabled }"
                    :disabled="disabled"
                    @focus="hideTotalPrice()"
                    @blur="showTotalPriceIfEmpty()"
                />
            </label>
        </Tooltip>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Tooltip } from 'ant-design-vue';
import FormatCurrency from './FormatCurrency.vue';

export default Vue.extend({
    components: { FormatCurrency, Tooltip },
    props: {
        totalPrice: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        minimumDepositDai: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
        amountToBid: {
            type: Object as Vue.PropType<BigNumber> | undefined,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            amountToBidInput: '' as string,
        };
    },
    computed: {
        isInputEmpty(): boolean {
            return this.amountToBidInput.trim() === '';
        },
        amountToBidInputParsed(): BigNumber | undefined {
            if (this.isInputEmpty) {
                return undefined;
            }
            const amountToBid = new BigNumber(this.amountToBidInput);
            return amountToBid;
        },
        error(): string | undefined {
            const maximumBid = this.totalPrice.minus(this.minimumDepositDai);
            if (this.amountToBidInputParsed?.isGreaterThan(maximumBid)) {
                return `The bidding amount can not be greater than ${maximumBid.toFixed(2)} DAI`;
            }
            if (this.amountToBidInputParsed?.isLessThan(this.minimumDepositDai)) {
                return `The bidding amount can not be smaller than ${this.minimumDepositDai.toFixed(2)} DAI`;
            }
            return undefined;
        },
    },
    watch: {
        amountToBidInputParsed(newVal, oldVal) {
            if (this.error) {
                this.$emit('update:amountToBid', new BigNumber(NaN));
                return;
            }
            if (newVal && newVal.isNaN()) {
                this.amountToBidInput = oldVal?.toFixed() || '';
                return;
            }
            if (newVal) {
                this.$emit('update:amountToBid', newVal);
            }
        },
        amountToBid(newVal: BigNumber | undefined) {
            if (!newVal) {
                this.amountToBidInput = '';
                return;
            }
            if (newVal.isEqualTo(this.minimumDepositDai)) {
                this.amountToBidInput = newVal.toFixed();
            }
        },
    },
    methods: {
        hideTotalPrice(): void {
            if (!this.amountToBid) {
                this.$emit('update:amountToBid', new BigNumber(NaN));
            }
        },
        showTotalPriceIfEmpty(): void {
            if (this.isInputEmpty) {
                this.$emit('update:amountToBid', undefined);
            }
        },
    },
});
</script>

<style scoped>
.Input {
    @apply border border-primary rounded-sm text-right w-full h-7 pr-8 hover:border-primary-light;
}

.Error {
    @apply border-red-500 hover:border-red-400;
}

.Input:focus {
    @apply outline-none border-2 border-primary-dark;
}

.Error:focus {
    @apply border-red-500;
}

.Inactive {
    @apply border-gray-400 hover:border-gray-400;
}
</style>
