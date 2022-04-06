<template>
    <BasePanel :current-state="currentStateAndTitle.name" :disabled="!isExplanationsShown">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock>
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
    name: 'NetProfitCheckPanel',
    components: { TextBlock, BasePanel },
    props: {
        netProfit: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (this.netProfit === undefined) {
                return {
                    name: 'notice',
                    title: `The transaction net profit is unknown`,
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
                title: `The transaction net profit is positive`,
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
