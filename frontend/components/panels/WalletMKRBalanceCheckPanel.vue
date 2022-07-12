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
            decentralized exchange like uniswap.org (correct MKR token address used on the “{{ network }}” network is
            <FormatAddress :value="tokenAddress" :shorten="true" type="address" />)
        </TextBlock>
        <div class="flex justify-end mt-5">
            <BaseButton :disabled="isDisabled" :is-loading="isLoading" @click="$emit('refresh')"
                >Refresh wallet balance</BaseButton
            >
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BasePanel from '../common/BasePanel.vue';
import TextBlock from '../common/TextBlock.vue';
import FormatCurrency from '../utils/FormatCurrency';
import BaseButton from '../common/BaseButton';
import FormatAddress from '../utils/FormatAddress.vue';

export default Vue.extend({
    name: 'WalletMKRCheckPanel',
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
            required: true,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isDisabled: {
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
                    title: `Please connect a wallet`,
                };
            }
            if (this.walletMKR.isLessThan(this.requiredMKR)) {
                return {
                    name: 'incorrect',
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
