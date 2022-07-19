<template>
    <Tooltip :title="tooltipText" placement="topLeft">
        <BaseValueInput
            :input-value="inputBidAmount"
            :max-value="maxValue"
            :min-value="minValue"
            :disabled="disabled"
            :validator="validator"
            :currency="currency"
            :fallback-value="fallbackValue"
            @update:inputValue="$emit('update:inputBidAmount', $event)"
        />
    </Tooltip>
</template>

<script lang="ts">
import Vue from 'vue';
import { Tooltip } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import BaseValueInput from '~/components/common/inputs/BaseValueInput.vue';

export default Vue.extend({
    components: {
        Tooltip,
        BaseValueInput,
    },
    props: {
        minValue: {
            type: Object as Vue.PropType<BigNumber | undefined>,
            default: undefined,
        },
        maxValue: {
            type: Object as Vue.PropType<BigNumber | undefined>,
            default: undefined,
        },
        inputBidAmount: {
            type: Object as Vue.PropType<BigNumber | undefined>,
            default: undefined,
        },
        isTooSmallToPartiallyTake: {
            type: Boolean,
            default: false,
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
        validator: {
            type: Function as Vue.PropType<Function>,
            default: () => {},
        },
    },
    computed: {
        tooltipText(): string {
            if (this.isTooSmallToPartiallyTake) {
                return `Not possible to change the amount since the leftover will be smaller than minimum`;
            }
            return '';
        },
    },
});
</script>
