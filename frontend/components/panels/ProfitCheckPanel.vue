<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="currentStateAndTitle.title === 'The transaction gross profit is negative'">
            You cannot execute an auction while it is not yet profitable. Once the auction price drops below the price
            on UniSwap, you may continue with the auction participation
        </TextBlock>
        <TextBlock v-else>
            Executing an auction with a negative net profit is possible, but according to our calculations it will
            result in a net loss due to the transaction fees being higher than the gross profit.
        </TextBlock>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BasePanel from '../common/BasePanel.vue';
import TextBlock from '../common/TextBlock.vue';

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
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (this.grossProfit === undefined || this.netProfit === undefined) {
                return {
                    name: 'incorrect',
                    title: `The transaction profit is unknown`,
                };
            }
            if (this.grossProfit.isNaN() || this.netProfit.isNaN()) {
                return {
                    name: 'incorrect',
                    title: `The transaction profit is unknown`,
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
                this.$emit('update:isCorrect', newCurrentStateAndTitle.name === 'correct');
            },
        },
    },
});
</script>
