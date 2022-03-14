<template>
    <div class="w-full inline-block relative flex-shrink-0">
        <Tooltip :visible="!!error" placement="topLeft" :title="error" class="items-center">
            <div v-if="!amountToBid" class="Overlay TotalPrice">
                <format-currency v-if="totalPrice && !disabled" :value="totalPrice" />
                <span v-else class="opacity-50">UNKNOWN</span>
            </div>
            <span class="Overlay right-1">DAI</span>
            <Input
                v-model="amountToBidInput"
                :disabled="disabled"
                class="Input"
                :class="{ Error: error }"
                @focus="hideTotalPrice()"
                @blur="showTotalPriceIfEmpty()"
            />
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
            const maximumBid = this.totalPrice?.minus(this.minimumDepositDai) || new BigNumber(0);
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
    @apply text-right;

    padding-right: 30px;
}

.Error {
    @apply border-red-500 hover:border-red-400;
}

.Error:focus {
    box-shadow: 0 0 3px rgb(239, 68, 68);
}

.Overlay {
    @apply absolute pointer-events-none z-10;

    top: 5.5px;
}

.TotalPrice {
    right: 30px;
}
</style>
