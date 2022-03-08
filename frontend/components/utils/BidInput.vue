<template>
    <div class="flex w-full items-center space-x-2 justify-end">
        <div v-if="value" class="text-primary hover:text-primary-light whitespace-nowrap" @click="resetToTotal()">
            Reset to Total
        </div>
        <div class="w-full inline-block relative flex-shrink-0">
            <Tooltip :visible="!!error" placement="topLeft" :title="error">
                <label>
                    <div v-if="!value" class="absolute text-right right-8 top-1">
                        <format-currency :value="totalPrice" />
                    </div>
                    <span class="absolute right-1 top-1">DAI</span>
                    <input
                        v-model="userInput"
                        class="Input"
                        :class="{ Error: error }"
                        @focus="hideTotalPrice()"
                        @input="validateInput()"
                        @blur="validateFinished()"
                    />
                </label>
            </Tooltip>
        </div>
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
        minimumDepositDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        value: {
            type: Object as Vue.PropType<BigNumber> | undefined,
            default: undefined,
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
    },
    methods: {
        validateInput(): void {
            this.error = undefined;

            if (!this.userInput) {
                return;
            }
            const value = new BigNumber(this.userInput);
            if (isNaN(value.toNumber())) {
                this.userInput = this.value?.toString();
                return;
            } else if (value.isGreaterThan(this.totalPrice)) {
                this.error = `The bidding amount can not be greater than ${this.totalPrice} DAI`;
            } else if (value.isLessThan(this.minimumDepositDAI)) {
                this.error = `The bidding amount can not be smaller than ${this.minimumDepositDAI} DAI`;
            } else {
                this.setValue(value);
            }
            if (this.error && this.value) {
                this.userInput = this.value.toString();
            }
        },
        hideTotalPrice(): void {
            if (!this.value) {
                this.setValue(new BigNumber(0));
            }
        },
        validateFinished() {
            this.error = undefined;
            if (!this.userInput) {
                this.userInput = '0';
            }
            if (this.value?.isEqualTo(this.totalPrice)) {
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
</style>
