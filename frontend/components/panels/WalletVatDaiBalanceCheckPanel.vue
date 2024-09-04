<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock>
            <div class="flex justify-between">
                <span>DAI amount in the wallet</span>
                <format-currency v-if="walletDai" :value="walletDai" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Currently deposited in VAT</span>
                <format-currency v-if="walletVatDai" :value="walletVatDai" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Minimum to deposit</span>
                <format-currency v-if="minimumDepositDai" :value="minimumDepositDai" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
        </TextBlock>
        <TextBlock v-if="isExplanationsShown && currentStateAndTitle.name === 'incorrect'" class="mt-2">
            The amount of <format-currency :value="transactionBidAmount" currency="DAI" /> is not present in the VAT
            and at least <format-currency :value="minimumDepositDai" currency="DAI" /> needs to be deposited before the
            transaction can happen.
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton
                :type="currentStateAndTitle.name === 'incorrect' ? 'primary' : 'default'"
                :disabled="disabled"
                :is-loading="isLoading"
                @click="$emit('manageVat')"
            >
                Manage DAI in VAT
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        FormatCurrency,
    },
    props: {
        walletDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletVatDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        transactionBidAmount: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        minimumDepositDai(): BigNumber | undefined {
            if (!this.transactionBidAmount || !this.walletVatDai) {
                return undefined;
            }
            return BigNumber.maximum(0, this.transactionBidAmount.minus(this.walletVatDai));
        },
        currentStateAndTitle(): PanelProps {
            if (!this.walletDai) {
                return {
                    name: 'inactive',
                    title: 'The VAT balance is unknown until a wallet is connected',
                };
            }
            if (this.transactionBidAmount.isNaN()) {
                return {
                    name: 'inactive',
                    title: 'The amount to bid is invalid',
                };
            }
            if (this.minimumDepositDai?.isGreaterThan(0)) {
                return {
                    name: 'incorrect',
                    title: 'The amount is not present in the VAT',
                };
            }
            return {
                name: 'correct',
                title: 'The amount is present in the VAT',
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
