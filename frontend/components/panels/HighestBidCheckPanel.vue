<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="isExplanationsShown">
            In order to win the auction, participants can bid on the auction. In case someone puts a higher bid on the
            auction, you receive your MKR back, only losing the transaction fees.
        </TextBlock>

        <div class="flex justify-between my-3">
            Current Highest Bid
            <span v-if="latestBid === null" class="text-gray-400"> There were no bids yet </span>
            <FormatCurrency v-else :value="latestBid" currency="MKR" />
        </div>

        <div class="flex justify-end gap-5">
            <BaseButton
                class="w-full md:w-80"
                :type="isUserLatestBidder ? 'secondary' : 'primary'"
                :disabled="isBidding || disabled || !userWalletAddress || isLoading || !!error"
                :is-loading="isBidding || isLoading"
                @click="$emit('bid', bidAmount)"
            >
                <span v-if="isBidding"> Bidding... </span>
                <span v-else-if="isLoading"> Loading... </span>
                <span v-else-if="auction"
                    >Bid <FormatCurrency :value="bidAmount" currency="MKR" /> on
                    <FormatCurrency :value="auction.receiveAmountDAI" currency="DAI"
                /></span>
                <span v-else>Unknown</span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { SurplusAuction } from 'auctions-core/dist/src/types';
import BigNumber from 'bignumber.js';
import BasePanel from '../common/BasePanel.vue';
import TextBlock from '../common/TextBlock.vue';
import BaseButton from '../common/BaseButton.vue';
import FormatCurrency from '../utils/FormatCurrency.vue';

export default Vue.extend({
    name: 'HighestBidCheckPanel',
    components: { FormatCurrency, BaseButton, TextBlock, BasePanel },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuction>,
            default: null,
            required: true,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        bidAmount: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
        isBidding: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        error: {
            type: String,
            default: null,
        },
    },
    computed: {
        latestBid(): BigNumber | null {
            return this.auction.bidAmountMKR.isEqualTo(0) ? null : this.auction.bidAmountMKR;
        },
        isUserLatestBidder(): boolean {
            return !!this.latestBid && this.auction.receiverAddress === this.walletAddress;
        },
        currentStateAndTitle(): PanelProps {
            if (!this.walletAddress && !this.latestBid) {
                return {
                    name: 'notice',
                    title: `No bids yet`,
                };
            }
            if (this.auction.state === 'ready-for-collection') {
                if (this.isUserLatestBidder) {
                    return {
                        name: 'inactive',
                        title: `You are the highest bidder`,
                    };
                }
                return {
                    name: 'inactive',
                    title: `You are not the highest bidder`,
                };
            }
            if (!this.latestBid) {
                return {
                    name: 'notice',
                    title: `No bids yet`,
                };
            }
            if (!this.walletAddress) {
                return {
                    name: 'notice',
                    title: `Highest bid by ${this.auction.receiverAddress}`,
                };
            }
            if (this.isUserLatestBidder) {
                return {
                    name: 'correct',
                    title: `You are the highest bidder`,
                };
            }
            return {
                name: 'notice',
                title: `You are not the highest bidder`,
            };
        },
    },
});
</script>
