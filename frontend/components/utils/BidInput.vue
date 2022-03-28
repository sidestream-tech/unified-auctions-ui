<template>
    <div class="w-full relative dark:text-gray-300">
        <Tooltip :visible="!!error" placement="topLeft" :title="error">
            <Tooltip placement="topLeft" :title="isTooSmallToPartiallyTakeTooltipContent">
                <Input
                    v-model="amountToBidInput"
                    :disabled="isDisabled"
                    class="Input"
                    :class="{ Error: error }"
                    @focus="hideTotalPrice()"
                    @blur="showTotalPriceIfEmpty()"
                />
                <div v-if="!amountToBid" class="Overlay TotalPrice">
                    <format-currency v-if="totalPrice" :value="totalPrice" :class="{ 'opacity-50': isDisabled }" />
                </div>
                <span class="Overlay right-1" :class="{ 'opacity-50': isDisabled }">DAI</span>
            </Tooltip>
        </Tooltip>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Input, Tooltip } from 'ant-design-vue';
import FormatCurrency from './FormatCurrency.vue';
export default Vue.extend({
    components: { FormatCurrency, Tooltip, Input },
    props: {
        totalPrice: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        minimumBidDai: {
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
            const maximumBid = this.totalPrice?.minus(this.minimumBidDai);
            if (
                this.amountToBidInputParsed?.isGreaterThan(maximumBid) ||
                this.amountToBidInputParsed?.isLessThan(this.minimumBidDai)
            ) {
                return `The value can only be between ${this.minimumBidDai.toFixed(2)} and ${maximumBid.toFixed(2)}`;
            }
            return undefined;
        },
        isTooSmallToPartiallyTake(): boolean {
            return this.totalPrice?.isLessThan(this.minimumBidDai.multipliedBy(2));
        },
        isDisabled(): boolean {
            return this.disabled || this.isTooSmallToPartiallyTake;
        },
        isTooSmallToPartiallyTakeTooltipContent(): string {
            if (this.isTooSmallToPartiallyTake) {
                return 'The value can not be changed since the leftover part will be too small';
            }
            return '';
        },
    },
    watch: {
        amountToBidInput(_newAmountToBidInput: string, oldAmountToBidInput: string) {
            if (this.error) {
                this.$emit('update:amountToBid', new BigNumber(NaN));
                return;
            }
            if (!this.amountToBidInputParsed) {
                return;
            }
            if (this.amountToBidInputParsed?.isNaN()) {
                this.amountToBidInput = oldAmountToBidInput || '';
                return;
            }
            this.$emit('update:amountToBid', this.amountToBidInputParsed);
        },
        amountToBid(newAmountToBid: BigNumber | undefined) {
            if (!newAmountToBid) {
                this.amountToBidInput = '';
                return;
            }
            if (newAmountToBid.isEqualTo(this.minimumDepositDai) && !newAmountToBid.isZero()) {
                this.amountToBidInput = newAmountToBid.toFixed();
            }
        },
        isTooSmallToPartiallyTake(newVal) {
            if (newVal) {
                this.$emit('update:amountToBid', undefined);
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
    @apply text-right;

    padding-right: 30px;
}

.Error {
    @apply border-red-500 hover:border-red-400;
}

.Error:focus {
    @apply border-red-400;

    box-shadow: 0 0 3px rgb(239, 68, 68);
}

.Overlay {
    @apply absolute pointer-events-none;

    top: 5.5px;
}

.TotalPrice {
    right: 30px;
}
</style>
