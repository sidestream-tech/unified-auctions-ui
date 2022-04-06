<template>
    <BasePanel :current-state="currentStateAndTitle.name" :disabled="!isExplanationsShown">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock>
            You cannot execute an auction while it is not yet profitable. Once the auction price drops below the price
            on UniSwap, you may continue with the bidding process
        </TextBlock>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BasePanel from '../common/BasePanel.vue';
import TextBlock from '../common/TextBlock.vue';

export default Vue.extend({
    name: 'GrossProfitCheckPanel',
    components: { TextBlock, BasePanel },
    props: {
        grossProfit: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (this.grossProfit === undefined) {
                return {
                    name: 'notice',
                    title: `The transaction gross profit is unknown`,
                };
            }
            if (this.grossProfit.isLessThanOrEqualTo(0)) {
                return {
                    name: 'incorrect',
                    title: `The transaction gross profit is negative`,
                };
            }
            return {
                name: 'correct',
                title: `The transaction gross profit is positive`,
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
