<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="isExplanationsShown">
            In order to win the auction, participants can bid on the auction. In case someone puts a higher bid on the
            auction, you receive your MKR back, only losing the transaction fees.
        </TextBlock>

        <TextBlock class="my-3">
            Current Highest Bid
            <span v-if="latestBid === null" class="flex justify-end gap-5"> There were no bids yet </span>

            <span v-else class="flex justify-end gap-5">
                <FormatCurrency :value="latestBid" currency="MKR" />
            </span>
        </TextBlock>

        <div class="flex justify-end gap-5">
            <BaseButton
                class="w-full md:w-80"
                :type="isUserLatestBidder ? 'secondary' : 'primary'"
                :disabled="isBidding || isDisabled || !userWalletAddress || isLoading || !!error"
                :is-loading="isBidding"
                @click="$emit('restart')"
            >
                <span v-if="isBidding"> Bidding... </span>
                <span v-else-if="auction"
                    >Bid <FormatCurrency :value="bidAmount" currency="MKR" /> on
                    <FormatCurrency :value="auction.receiveAmountDAI" currency="DAI"
                /></span>
                <span v-else-if="error">Unknown</span>
                <span v-else>Loading...</span>
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
        },
        userWalletAddress: {
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
        isDisabled: {
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
        latestBid() {
            if (!this.auction || !this.auction.bidAmountMKR) {
                return null;
            }
            return this.auction.bidAmountMKR;
        },
        isUserLatestBidder() {
            if (!this.latestBid) {
                return false;
            }
            return this.auction.receiverAddress === this.userWalletAddress;
        },
        currentStateAndTitle(): PanelProps {
            if (!this.userWalletAddress && !this.latestBid) {
                return {
                    name: 'inactive',
                    title: `No bids yet`,
                };
            }
            if (!this.latestBid) {
                return {
                    name: 'notice',
                    title: `No bids yet`,
                };
            }
            if (!this.userWalletAddress) {
                return {
                    name: 'inactive',
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
