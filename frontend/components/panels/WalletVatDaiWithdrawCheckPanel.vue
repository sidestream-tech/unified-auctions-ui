<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="WalletVatDaiWithdrawCheckPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            If you do not have enough DAI funds in the VAT, you will need to deposit them, before you can continue.
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton :disabled="disabled" :is-loading="isLoading" @click="$emit('refresh')"
                >Refresh wallet balance</BaseButton
            >
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
    },
    props: {
        walletVatDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        desiredAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (!this.walletVatDai) {
                return {
                    name: 'inactive',
                    title: 'Please connect a wallet',
                };
            }
            if (!this.desiredAmount || this.desiredAmount?.isNaN()) {
                return {
                    name: 'inactive',
                    title: 'Please enter the value to deposit first',
                };
            }
            if (this.desiredAmount.isLessThan(0)) {
                return {
                    name: 'incorrect',
                    title: 'The amount can not be negative',
                };
            }
            const isTooSmall = this.desiredAmount.isGreaterThan(this.walletVatDai);
            if (isTooSmall) {
                return {
                    name: 'incorrect',
                    title: 'The sufficient amount is not present in the VAT',
                };
            }
            return {
                name: 'correct',
                title: 'The sufficient amount is present in the VAT',
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
