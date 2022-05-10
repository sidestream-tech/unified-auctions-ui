<template>
    <Tooltip :title="tooltipText" placement="topLeft">
        <BaseValueInput
            :input-value="transactionBidAmount"
            :max-value="debtDai"
            :min-value="minimumBidDai"
            :disabled="disabled"
            :validator="validator"
            @update:inputValue="$emit('update:transactionBidAmount', $event)"
        />
    </Tooltip>
</template>

<script lang="ts">
import Vue from 'vue';
import { Tooltip } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import BaseValueInput from '~/components/common/BaseValueInput.vue';

export default Vue.extend({
    components: {
        Tooltip,
        BaseValueInput,
    },
    props: {
        minimumBidDai: {
            type: Object as Vue.PropType<BigNumber | undefined>,
            default: undefined,
        },
        debtDai: {
            type: Object as Vue.PropType<BigNumber | undefined>,
            default: undefined,
        },
        transactionBidAmount: {
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
    },
    computed: {
        tooltipText(): string {
            if (this.isTooSmallToPartiallyTake) {
                return `Not possible to change the amount since the leftover will be smaller than minimum`;
            }
            return '';
        },
    },
    methods: {
        validator(
            currentValue: BigNumber | undefined,
            minValue: BigNumber | undefined,
            maxValue: BigNumber | undefined
        ) {
            if (!currentValue || !minValue || !maxValue) {
                return;
            }
            const bidTopLimit = maxValue?.minus(minValue);
            if (currentValue?.isGreaterThan(bidTopLimit)) {
                throw new Error(`The value can only be between 0 and ${bidTopLimit.toFixed(2)} or the maximum`);
            }
            if (maxValue?.isLessThan(minValue.multipliedBy(2))) {
                throw new Error('The value can not be changed since the leftover part will be too small');
            }
        },
    },
});
</script>
