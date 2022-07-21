<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>

        <TextBlock>
            <div class="flex justify-between">
                <span>MKR amount in wallet</span>
                <format-currency v-if="walletMKR" :value="walletMKR" currency="MKR" />
                <div v-else class="opacity-75">
                    <span>Unknown</span>
                    <span>MKR</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Required for bid</span>
                <format-currency v-if="requiredMKR" :value="requiredMKR" currency="MKR" />
                <div v-else class="opacity-75">
                    <span>Unknown</span>
                    <span>MKR</span>
                </div>
            </div>
        </TextBlock>

        <TextBlock v-if="isExplanationsShown" class="mt-5">
            If you do not have enough MKR funds in your wallet, you can obtain it for example by purchasing it on a
            decentralized exchange like
            <a href="https://uniswap.org/" target="_blank">uniswap.org</a>
            (correct MKR token address used on the “{{ network }}” network is
            <FormatAddress v-if="tokenAddress" :value="tokenAddress" :shorten="true" type="address" />)
        </TextBlock>
        <div class="flex justify-end mt-5">
            <BaseButton class="w-full md:w-80" :disabled="disabled" :is-loading="isLoading" @click="$emit('refresh')"
                >Refresh wallet balance</BaseButton
            >
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency';
import BaseButton from '~/components/common/inputs/BaseButton';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

export default Vue.extend({
    name: 'WalletMKRBalanceCheckPanel',
    components: { FormatAddress, TextBlock, BasePanel, FormatCurrency, BaseButton },
    props: {
        walletMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        requiredMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        tokenAddress: {
            type: String,
            default: undefined,
        },
        network: {
            type: String,
            default: 'mainnet',
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
        currentStateAndTitle(): PanelProps {
            if (this.walletMKR === undefined) {
                return {
                    name: 'inactive',
                    title: `Please connect a wallet to check the amount MKR present`,
                };
            }
            if (this.walletMKR.isLessThan(this.requiredMKR)) {
                return {
                    name: this.disabled ? 'inactive' : 'incorrect',
                    title: `The amount of MKR is not present in the connected wallet`,
                };
            }
            return {
                name: 'correct',
                title: `Required amount of MKR is present in the connected wallet`,
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
