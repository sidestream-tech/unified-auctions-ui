<template>
    <Tooltip :visible="!!errorMessage" placement="topLeft" :title="errorMessage">
        <div class="ant-input BaseValueInput" :class="{ Error: !!errorMessage, Disabled: disabled }">
            <input
                ref="input"
                v-model="inputText"
                class="Input"
                :disabled="disabled"
                @focus="hideMaxValue"
                @blur="showMaxValueIfEmpty"
            />
            <div class="whitespace-nowrap" @click="$refs.input.focus()">
                <format-currency v-if="!inputValue && fallbackValue" :value="fallbackValue" />
                {{ currency }}
            </div>
        </div>
    </Tooltip>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Tooltip } from 'ant-design-vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    components: { FormatCurrency, Tooltip },
    props: {
        inputValue: {
            type: Object as Vue.PropType<BigNumber> | undefined,
            default: undefined,
        },
        minValue: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        maxValue: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        validator: {
            type: Function as Vue.PropType<Function>,
            default: () => {},
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        currency: {
            type: String,
            default: 'DAI',
        },
        fallbackValue: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
    },
    data() {
        return {
            inputText: '',
        };
    },
    computed: {
        isInputEmpty(): boolean {
            return this.inputText.trim() === '';
        },
        inputTextParsed(): BigNumber | undefined {
            if (this.isInputEmpty) {
                return undefined;
            }
            return new BigNumber(this.inputText.trim());
        },
        errorMessage(): string {
            try {
                if (this.validator) {
                    this.validator(this.inputTextParsed, this.minValue, this.maxValue);
                }
            } catch (error) {
                return error.message;
            }
            return '';
        },
    },
    watch: {
        inputText(_newInputText: string, oldInputText: string) {
            if (!this.inputTextParsed) {
                return;
            }
            if (this.errorMessage) {
                this.$emit('update:inputValue', new BigNumber(NaN));
                return;
            }
            if (this.inputTextParsed.isNaN()) {
                this.inputText = oldInputText || '';
                return;
            }
            this.$emit('update:inputValue', this.inputTextParsed);
        },
        inputValue(newInputValue: BigNumber | undefined) {
            if (!newInputValue) {
                this.inputText = '';
                return;
            }
            if (newInputValue.isEqualTo(this.minValue) && !newInputValue.isZero()) {
                this.inputText = newInputValue.toFixed();
            }
        },
    },
    methods: {
        hideMaxValue(): void {
            if (!this.inputValue) {
                this.$emit('update:inputValue', new BigNumber(NaN));
            }
        },
        showMaxValueIfEmpty(): void {
            if (this.isInputEmpty) {
                this.$emit('update:inputValue', undefined);
            }
        },
    },
});
</script>

<style scoped>
.BaseValueInput {
    @apply flex justify-end w-full;
}

.Input {
    @apply flex-grow text-right border-none outline-none pr-1 bg-transparent disabled:cursor-not-allowed;
}

.Disabled {
    @apply bg-gray-200 dark:bg-gray-500 cursor-not-allowed;
}

.Error {
    @apply border-red-500 hover:border-red-400;
}

.Error:focus {
    @apply border-red-400;

    box-shadow: 0 0 3px rgb(239, 68, 68);
}
</style>
