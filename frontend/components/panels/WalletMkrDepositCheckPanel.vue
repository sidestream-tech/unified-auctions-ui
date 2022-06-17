<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock>
            <div class="flex justify-between">
                <span>MKR amount in the wallet</span>
                <format-currency v-if="walletMkr" :value="walletMkr" currency="MKR" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>MKR</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Currently deposited in VAT</span>
                <format-currency v-if="walletVatMkr" :value="walletVatMkr" currency="MKR" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>MKR</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Minimum to deposit</span>
                <format-currency v-if="minimumDepositMkr" :value="minimumDepositMkr" currency="MKR" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>MKR</span>
                </div>
            </div>
        </TextBlock>
        <TextBlock v-if="isExplanationsShown">
            If you do not have MKR funds to deposit yet, you can obtain it for example by purchasing it on a
            decentralized exchange like
            <a href="https://uniswap.org/" target="_blank">uniswap.org</a>
            (correct MKR token address used on the “{{ networkTitle }}” network is
            <FormatAddress type="address" :value="tokenAddressMkr" shorten />)
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton :disabled="disabled" :is-loading="isLoading" @click="$emit('refresh')">
                Refresh wallet balance
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
import { BigNumber } from 'bignumber.js';
import BaseButton from '~/components/common/BaseButton.vue';
import BasePanel from '~/components/common/BasePanel.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        FormatAddress,
        FormatCurrency,
    },
    props: {
        walletMkr: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        walletVatMkr: {
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
        tokenAddressMkr: {
            type: String,
            default: '',
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
        minimumDepositMkr(): BigNumber | undefined {
            if (!this.desiredAmount || !this.walletVatMkr || this.desiredAmount.isLessThan(0)) {
                return undefined;
            }
            return BigNumber.maximum(0, this.desiredAmount.minus(this.walletVatMkr));
        },
        currentStateAndTitle(): PanelProps {
            if (!this.walletMkr) {
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
            const isTooSmall = this.desiredAmount.isGreaterThan(this.walletMkr);
            if (isTooSmall) {
                return {
                    name: 'incorrect',
                    title: 'The sufficient amount of MKR is not present in the connected wallet',
                };
            }
            return {
                name: 'correct',
                title: 'The sufficient amount of MKR is present in the connected wallet',
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
