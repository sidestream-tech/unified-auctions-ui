<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="WalletDaiDepositCheckPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            If you do not have DAI funds to deposit yet, there are several ways to obtain them:
            <ul class="list-disc list-inside">
                <li>
                    By borrowing DAI against a collateral in the
                    <a href="https://oasis.app/" target="_blank">oasis.app</a>
                </li>
                <li>
                    By purchasing it on a decentralized exchange like
                    <a href="https://uniswap.org/" target="_blank">uniswap.org</a> (correct DAI token address used on
                    the “{{ networkTitle }}” network is
                    <FormatAddress type="address" :value="tokenAddressDai" shorten />)
                </li>
            </ul>
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
import BaseButton from '~/components/common/BaseButton.vue';
import BasePanel from '~/components/common/BasePanel.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        FormatAddress,
    },
    props: {
        walletDai: {
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
        tokenAddressDai: {
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
        currentStateAndTitle(): PanelProps {
            if (!this.walletDai) {
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
            const isTooSmall = this.desiredAmount.isGreaterThan(this.walletDai);
            if (isTooSmall) {
                return {
                    name: 'incorrect',
                    title: 'The sufficient amount of DAI is not present in the connected wallet',
                };
            }
            return {
                name: 'correct',
                title: 'The sufficient amount of DAI is present in the connected wallet',
            };
        },
        networkTitle(): string {
            try {
                return this.$store.getters['network/getNetworkConfigByType'](this.network).title;
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
