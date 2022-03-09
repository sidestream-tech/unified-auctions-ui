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
            required: true,
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
        };
    },
    computed: {
        showErrorPopup(): boolean {
            return !!this.error;
        },
        maximumBid(): BigNumber {
            return this.totalPrice.minus(this.minimumDepositDai);
        },
        error(): string | undefined {
            if (!this.userInput) {
                return undefined;
            }
            const value = new BigNumber(this.userInput);
            if (value.isGreaterThan(this.maximumBid)) {
                return `The bidding amount can not be greater than ${this.maximumBid.toFixed(2)} DAI`;
            }
            if (value.isLessThan(this.minimumDepositDai)) {
                return `The bidding amount can not be smaller than ${this.minimumDepositDai.toFixed(2)} DAI`;
            }
            return undefined;
        },
    },
    watch: {
        value(newVal: BigNumber | undefined): void {
            if (!newVal) {
                this.setValue(undefined);
                return;
            }
            if (newVal.isEqualTo(this.totalPrice)) {
                this.setValue(undefined);
            }
            if (newVal.isEqualTo(this.minimumDepositDai)) {
                this.userInput = newVal.toString();
            }
        },
        error(newVal): void {
            if (newVal) {
                this.setValue(new BigNumber(NaN));
            }
            this.$emit('error', newVal);
        },
        userInput(newVal, oldVal) {
            this.validateInput(newVal, oldVal);
        },
    },
    methods: {
        validateInput(newVal: string, oldVal: string): void {
            if (!newVal) {
                return;
            }
            const value = new BigNumber(newVal);
            if (value.isNaN()) {
                this.userInput = oldVal;
                return;
            }
            if (!this.error) {
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
                this.setValue(undefined);
            }
            if (!this.value || this.value.isEqualTo(this.totalPrice)) {
                this.setValue(undefined);
            }
        },
        setValue(value: BigNumber | undefined) {
            if (!value) {
                this.userInput = undefined;
            }
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
