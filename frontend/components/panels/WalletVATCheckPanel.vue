<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <div class="flex flex-col gap-2">
            <TextBlock v-if="isTableShown">
                <div class="flex justify-between">
                    <span>{{ currency }} amount in the wallet</span>
                    <format-currency v-if="walletAmount" :value="walletAmount" :currency="currency" />
                    <div v-else>
                        <span class="opacity-50">Unknown</span>
                        <span>{{ currency }}</span>
                    </div>
                </div>
                <div class="flex justify-between">
                    <span>Currently deposited in VAT</span>
                    <format-currency v-if="walletVatAmount" :value="walletVatAmount" :currency="currency" />
                    <div v-else>
                        <span class="opacity-50">Unknown</span>
                        <span>{{ currency }}</span>
                    </div>
                </div>
                <div class="flex justify-between">
                    <span>Minimum to deposit</span>
                    <format-currency v-if="minimumDepositAmount" :value="minimumDepositAmount" :currency="currency" />
                    <div v-else>
                        <span class="opacity-50">Unknown</span>
                        <span>{{ currency }}</span>
                    </div>
                </div>
            </TextBlock>
            <TextBlock v-if="isExplanationsShown">
                If you do not have {{ currency }} funds to deposit yet, you can obtain them:
                <ul class="list-disc list-inside">
                    <li v-if="currency === 'DAI'">
                        By borrowing DAI against a collateral in the
                        <a href="https://oasis.app/" target="_blank">oasis.app</a>
                    </li>
                    <li>
                        By purchasing it on a decentralized exchange like
                        <a href="https://uniswap.org/" target="_blank">uniswap.org</a> (correct {{ currency }} token
                        address used on the “{{ networkTitle }}” network is
                        <FormatAddress v-if="tokenAddress" type="address" :value="tokenAddress" shorten />
                        <span v-else> unknown </span>)
                    </li>
                </ul>
            </TextBlock>
        </div>
        <div class="flex justify-end mt-2">
            <BaseButton :disabled="disabled" :is-loading="isLoading" @click="$emit('refresh')">
                Refresh wallet balance
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { getNetworkConfigByType } from 'auctions-core/src/network';
import { BigNumber } from 'bignumber.js';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        FormatAddress,
        FormatCurrency,
    },
    props: {
        walletAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        walletVatAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        desiredAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        network: {
            type: String,
            default: undefined,
        },
        tokenAddress: {
            type: String,
            default: '',
        },
        currency: {
            type: String,
            default: 'DAI',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isTableShown: {
            type: Boolean,
            default: true,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        minimumDepositAmount(): BigNumber | undefined {
            if (!this.desiredAmount || !this.walletVatAmount || this.desiredAmount.isLessThan(0)) {
                return undefined;
            }
            return BigNumber.maximum(0, this.desiredAmount.minus(this.walletVatAmount));
        },
        currentStateAndTitle(): PanelProps {
            if (!this.walletAmount) {
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
                    title: 'The amount cannot be negative',
                };
            }
            const isTooSmall = this.desiredAmount.isGreaterThan(this.walletAmount);
            if (isTooSmall) {
                return {
                    name: 'incorrect',
                    title: `The sufficient amount of ${this.currency} is not present in the connected wallet`,
                };
            }
            return {
                name: 'correct',
                title: `The sufficient amount of ${this.currency} is present in the connected wallet`,
            };
        },
        networkTitle(): string {
            try {
                return getNetworkConfigByType(this.network).title;
            } catch {
                return this.network;
            }
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
