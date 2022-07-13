<template>
    <div class="BaseValueInput">
        <Tooltip :visible="!!errorMessage" placement="topLeft" :title="errorMessage">
            <Input
                v-model="inputText"
                class="Input pr-8"
                :class="{ Error: !!errorMessage, 'pr-10': auctionType === 'surplus' }"
                :disabled="disabled"
                @focus="hideMaxValue"
                @blur="showMaxValueIfEmpty"
            />
            <div class="Overlay right-2" :class="{ 'opacity-50': disabled }">
                <div v-if="auctionType === 'surplus'">
                    <format-currency v-if="!inputValue && minValue" :value="minValue" /> MKR
                </div>
                <div v-else><format-currency v-if="!inputValue && maxValue" :value="maxValue" />&nbsp;DAI</div>
            </div>
        </Tooltip>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Input, Tooltip } from 'ant-design-vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    components: { FormatCurrency, Tooltip, Input },
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
        auctionType: {
            type: String,
            default: 'collateral',
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
    @apply w-full relative dark:text-gray-300;
}

.Input {
    @apply text-right;
}

.Error {
    @apply border-red-500 hover:border-red-400;
}

.Error:focus {
    @apply border-red-400;

    box-shadow: 0 0 3px rgb(239, 68, 68);
}

.Overlay {
    @apply absolute pointer-events-none h-full flex items-center;

    top: 0.5px;
}

.input-icon {
    position: relative;
}

.input-icon > i {
    position: absolute;
    display: block;
    transform: translate(0, -50%);
    top: 50%;
    pointer-events: none;
    width: 25px;
    text-align: center;
    font-style: normal;
}

.input-icon > input {
    padding-left: 25px;
    padding-right: 0;
}

.input-icon-right > i {
    right: 0;
}

.input-icon-right > input {
    padding-left: 0;
    padding-right: 25px;
    text-align: right;
}
</style>
