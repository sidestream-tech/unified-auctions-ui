<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>
            {{ currentStateAndTitle.title }}
            <TimeTill v-if="auction.state === 'have-bids'" :date="auction.earliestEndDate" />
        </template>

        <TextBlock v-if="auction.state === 'ready-for-collection'">
            <div v-if="isCurrentWalletHighestBidder">
                Since the auction ended at {{ auction.earliestEndDate.toUTCString() }}, you can now collect the auction
                amount.
            </div>

            <div v-else>
                Since the auction ended at {{ auction.earliestEndDate.toUTCString() }}, you can now collect the auction
                amount. Note however that the auction amount will be transferred to the highest bidder's wallet.
            </div>
        </TextBlock>

        <TextBlock v-else-if="auction.state === 'collected'">
            This auction has ended and the amount has been collected.
        </TextBlock>

        <TextBlock v-else>
            If no one else bids on the auction, one will be able to collect the auction amount when the auction is
            ended after {{ auction.earliestEndDate.toUTCString() }}.
        </TextBlock>

        <div class="flex justify-end mt-3">
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :disabled="auction.state !== 'ready-for-collection' || isCollecting"
                :is-loading="isCollecting"
                @click="$emit('collect')"
            >
                <span v-if="isCollecting">Collecting...</span>
                <span v-else
                    >Collect
                    <format-currency
                        :value="auction.receiveAmountDAI || auction.receiveAmountMKR"
                        :currency="currency"
                    />
                </span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { DebtAuction, SurplusAuction } from 'auctions-core/src/types';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
export default Vue.extend({
    name: 'CollectAuctionPanel',
    components: { TimeTill, FormatCurrency, TextBlock, BasePanel, BaseButton },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuction | DebtAuction>,
            default: undefined,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isCollecting: {
            type: Boolean,
            default: false,
        },
        currency: {
            type: String,
            default: 'DAI',
        },
    },
    computed: {
        isCurrentWalletHighestBidder() {
            return (
                this.auction.receiverAddress &&
                this.walletAddress &&
                this.auction.receiverAddress.toLowerCase() === this.walletAddress.toLowerCase()
            );
        },
        currentStateAndTitle(): PanelProps {
            if (this.auction.state === 'just-started') {
                return {
                    name: 'inactive',
                    title: `Collecting ${this.currency} will not be possible until at least one bid`,
                };
            }
            if (this.auction.state === 'ready-for-collection') {
                if (this.isCurrentWalletHighestBidder) {
                    return {
                        name: 'notice',
                        title: `Auctioned ${this.currency} is ready to be collected`,
                    };
                }
                return {
                    name: 'inactive',
                    title: `Auctioned ${this.currency} is ready to be collected, but you're not the winner`,
                };
            }
            if (this.auction.state === 'collected') {
                return {
                    name: this.isCurrentWalletHighestBidder ? 'correct' : 'inactive',
                    title: `Auctioned ${this.currency} has been collected`,
                };
            }
            if (this.isCurrentWalletHighestBidder) {
                return {
                    name: 'notice',
                    title: `Collecting ${this.currency} will be possible in `,
                };
            }
            return {
                name: 'inactive',
                title: `Collecting ${this.currency} will be possible in `,
            };
        },
    },
});
</script>
