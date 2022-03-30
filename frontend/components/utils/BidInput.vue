<template>
    <BaseValueInput
        :input-value="transactionBidAmount"
        :max-value="totalPrice"
        :min-value="minimumDepositDai"
        :disabled="!canWithdraw"
        :validator="validator"
        @update:inputValue="$emit('update:transactionBidAmount', $event)"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BaseValueInput from '~/components/common/BaseValueInput.vue';

export default Vue.extend({
    components: {
        BaseValueInput,
    },
    props: {
        totalPrice: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        minimumBidDai: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
        transactionBidAmount: {
            type: Object as Vue.PropType<BigNumber> | undefined,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        validator(currentValue: BigNumber, minValue: BigNumber, maxValue: BigNumber) {
            const bidTopLimit = maxValue?.minus(minValue);
            if (currentValue?.isGreaterThan(bidTopLimit) || currentValue?.isLessThan(minValue)) {
                throw new Error(`The value can only be between ${minValue.toFixed(2)} and ${bidTopLimit.toFixed(2)}`);
            }
            if (maxValue?.isLessThan(minValue.multipliedBy(2))) {
                throw new Error('The value can not be changed since the leftover part will be too small');
            }
        },
    },
});
</script>
