<template>
    <div class="w-full inline-block relative flex-shrink-0">
        <Tooltip :visible="!!error" placement="topLeft" :title="error">
            <label>
                <div v-if="!value" class="absolute text-right right-8 top-1">
                    <format-currency v-if="totalPrice && !disabled" :value="totalPrice" />
                    <span v-else class="opacity-50">UNKNOWN</span>
                </div>
                <span class="absolute right-1 top-1">DAI</span>
                <input
                    v-model="userInput"
                    class="Input"
                    :class="{ Error: error, Inactive: disabled }"
                    :disabled="disabled"
                    @focus="hideTotalPrice()"
                    @blur="validateFinished()"
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
            default: null,
        },
        value: {
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
            userInput: undefined as string | undefined,
            error: undefined as string | undefined,
        };
    },
    computed: {
        showErrorPopup(): boolean {
            return !!this.error;
        },
        maximumBid(): BigNumber {
            return this.totalPrice.minus(this.minimumDepositDai);
        },
    },
    watch: {
        value(newVal: BigNumber | undefined): void {
            if (!newVal) {
                this.resetToTotal();
                return;
            }
            if (newVal.isEqualTo(this.totalPrice)) {
                this.resetToTotal();
            }
            if (newVal.isEqualTo(this.minimumDepositDai)) {
                this.userInput = newVal.toString();
            }
        },
        error(newVal): void {
            this.$emit('error', newVal);
        },
        userInput(newVal, oldVal) {
            this.validateInput(newVal, oldVal);
        },
        totalPrice(newVal: BigNumber | undefined) {
            if (newVal && newVal.minus(this.minimumDepositDai).isLessThan(this.value)) {
                this.error = `The bidding amount can not be greater than ${this.maximumBid.toFixed(2)} DAI`;
            }
        },
    },
    methods: {
        validateInput(newVal: string, oldVal: string): void {
            this.error = undefined;
            if (!newVal) {
                return;
            }
            const value = new BigNumber(newVal);
            if (isNaN(value.toNumber())) {
                this.userInput = oldVal;
            } else if (value.isGreaterThan(this.maximumBid)) {
                this.error = `The bidding amount can not be greater than ${this.maximumBid.toFixed(2)} DAI`;
            } else if (value.isLessThan(this.minimumDepositDai)) {
                this.error = `The bidding amount can not be smaller than ${this.minimumDepositDai.toFixed(2)} DAI`;
            } else {
                this.setValue(value);
            }
        },
        hideTotalPrice(): void {
            if (!this.value) {
                this.setValue(new BigNumber(0));
            }
        },
        validateFinished() {
            if (!this.userInput) {
                this.userInput = '0';
            }
            if (!this.value || this.value.isEqualTo(this.totalPrice)) {
                this.resetToTotal();
            }
        },
        resetToTotal() {
            this.userInput = undefined;
            this.setValue(undefined);
        },
        setValue(value: BigNumber | undefined) {
            this.$emit('input', value);
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
