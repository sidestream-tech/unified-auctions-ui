<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="isExplanationsShown" class="mb-1">
            The gross profit is the auctions profit in DAI if you were to execute it at its current price. The net
            profit is the amount you would actually receive after transaction fees. Please note that this value is only
            approximate, since it is extrapolated from the exchange rates and may change during the transaction.
        </TextBlock>
        <TextBlock v-if="currentStateAndTitle.title === 'The transaction gross profit is negative'">
            You cannot execute an auction while it is not yet profitable. Once the auction price drops below the price
            on UniSwap, you may continue with the auction participation
        </TextBlock>
        <TextBlock v-else-if="currentStateAndTitle.name === 'notice'">
            Executing an auction with a negative net profit is possible, but according to our calculations it will
            result in a net loss due to the transaction fees being higher than the gross profit.
        </TextBlock>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    name: 'ProfitCheckPanel',
    components: { TextBlock, BasePanel },
    props: {
        grossProfit: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        netProfit: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (this.grossProfit === undefined || this.grossProfit?.isNaN()) {
                return {
                    name: 'incorrect',
                    title: `The transaction gross profit is unknown`,
                };
            }
            if (this.netProfit === undefined || this.netProfit?.isNaN()) {
                return {
                    name: 'incorrect',
                    title: `The transaction net profit is unknown`,
                };
            }
            if (this.grossProfit.isLessThanOrEqualTo(0)) {
                return {
                    name: 'incorrect',
                    title: `The transaction gross profit is negative`,
                };
            }
            if (this.netProfit.isLessThanOrEqualTo(0)) {
                return {
                    name: 'notice',
                    title: `The transaction net profit is negative`,
                };
            }
            return {
                name: 'correct',
                title: `The transaction profit is positive`,
            };
        },
    },
    watch: {
        currentStateAndTitle: {
            immediate: true,
            handler(newCurrentStateAndTitle) {
                this.$emit('update:isCorrect', ['correct', 'notice'].includes(newCurrentStateAndTitle.name));
            },
        },
    },
});
</script>
