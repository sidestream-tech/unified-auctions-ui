<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="AuctionRestartPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>

        <TextBlock v-if="isExplanationsShown && auctionType === 'collateral'">
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

        <TextBlock v-else-if="isExplanationsShown && auctionType === 'compensation'">
            Auction that was started but hasn't received a single bid in the allotted time. When restarted bids can be
            placed again.
        </TextBlock>

        <WalletConnectionCheckPanel
            class="my-3"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            :is-loading="isConnecting"
            @connectWallet="$emit('connectWallet')"
            @disconnectWallet="$emit('disconnectWallet')"
        />

        <div class="flex justify-end gap-5">
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
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';

export default Vue.extend({
    name: 'AuctionRestartPanel',
    components: { WalletConnectionCheckPanel, BaseButton, FormatCurrency, Explain, TextBlock, BasePanel },
    props: {
        auctionType: {
            type: String,
            default: 'collateral',
        },
        walletAddress: {
            type: String,
            default: null,
        },
        transactionFee: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: null,
        },
        isRestarting: {
            type: Boolean,
            default: false,
        },
        isConnecting: {
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
            return {
                name: 'incorrect',
                title: 'The auction is currently inactive.',
            };
        },
        isDisabled(): boolean {
            return this.disabled || !this.walletAddress;
        },
    },
});
</script>
