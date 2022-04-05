<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="AuctionRestartPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>

        <TextBlock v-if="isExplanationsShown">
            Auction that either has experienced a too steep decrease in price or has reached its time limit becomes
            inactive and requires interaction to be restarted. When restarted, a new price is calculated and a fresh
            time limit is set. Restarting an auction includes an
            <Explain text="incentive">
                The
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#liquidation-incentive-mechanism"
                    target="_blank"
                >
                    incentive
                </a>
                consist of two positions:
                <ul class="list-inside list-decimal">
                    <li class="my-2">
                        An on a per-collateral type basis, constant amount of DAI →
                        <a
                            href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#clipper-chip-wad"
                            target="_blank"
                        >
                            Chip
                        </a>
                    </li>
                    <li class="my-2">
                        An amount of DAI that scales linearly with the amount of debt associated with the liquidation →
                        <a
                            href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#clipper-tip-rad"
                            target="_blank"
                        >
                            Tip
                        </a>
                    </li>
                </ul>
            </Explain>
            that is sent to the participant’s wallet. However, this action incurs transaction fee of approximately
            <FormatCurrency :value="transactionFee" :decimals="5" currency="eth" />.
        </TextBlock>
        <div class="flex justify-end mt-2 gap-5">
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :disabled="isDisabled"
                :is-loading="isRestarting"
                @click="$emit('restart')"
            >
                <span v-if="isRestarting">Restarting...</span>
                <span v-else>Restart Auction</span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BasePanel from '../common/BasePanel.vue';
import TextBlock from '../common/TextBlock.vue';
import Explain from '../utils/Explain.vue';
import FormatCurrency from '../utils/FormatCurrency.vue';
import BaseButton from '../common/BaseButton.vue';

export default Vue.extend({
    name: 'AuctionRestartPanel',
    components: { BaseButton, FormatCurrency, Explain, TextBlock, BasePanel },
    props: {
        auctionIsActive: {
            type: Boolean,
            default: false,
        },
        transactionFee: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: null,
        },
        isRestarting: {
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
            if (!this.auctionIsActive) {
                return {
                    name: 'notice',
                    title: 'The auction is currently inactive.',
                };
            }
            return {
                name: 'correct',
                title: 'The auction is active.',
            };
        },
        isDisabled(): boolean {
            return this.disabled || this.auctionIsActive;
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
