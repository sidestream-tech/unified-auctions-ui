<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="isExplanationsShown">
            In order to win the auction, participants can bid on the auction. In case someone puts a higher bid on the
            auction, you receive your MKR back, only losing the transaction fees.
        </TextBlock>

        <div class="flex justify-between my-3">
            <span>
                Current Highest Bid
                <span v-if="auction.receiverAddress"
                    >by <FormatAddress :value="auction.receiverAddress" type="address" shorten
                /></span>
            </span>
            <span v-if="!wasThereAnyBids" class="text-gray-400"> There were no bids yet </span>
            <FormatCurrency v-else :value="auction.bidAmountMKR" currency="MKR" />
        </div>

        <div class="flex justify-end gap-5">
            <BaseButton
                class="w-full md:w-80"
                :type="isUserLatestBidder ? 'secondary' : 'primary'"
                :disabled="isBidding || disabled || !walletAddress || isLoading || !!error"
                :is-loading="isBidding || isLoading"
                @click="bid"
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
import { SurplusAuction } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

export default Vue.extend({
    name: 'HighestBidCheckPanel',
    components: {
        FormatCurrency,
        FormatAddress,
        BaseButton,
        TextBlock,
        BasePanel,
    },
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
        bidAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
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
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        wasThereAnyBids(): boolean {
            if (!this.auction.bidAmountMKR) {
                return false;
            }
            return !this.auction.bidAmountMKR.isZero();
        },
        isUserLatestBidder(): boolean {
            return (
                this.wasThereAnyBids &&
                this.auction.receiverAddress &&
                this.walletAddress &&
                this.auction.receiverAddress.toLowerCase() === this.walletAddress.toLowerCase()
            );
        },
        currentStateAndTitle(): PanelProps {
            if (this.auction.state === 'collected') {
                return {
                    name: 'inactive',
                    title: `The auction has finished and been collected`,
                };
            }
            if (!this.wasThereAnyBids) {
                return {
                    name: 'notice',
                    title: 'No bids yet',
                };
            }
            if (this.auction.state !== 'ready-for-collection') {
                if (this.isUserLatestBidder) {
                    return {
                        name: 'correct',
                        title: 'You are the highest bidder',
                    };
                }
                return {
                    name: 'notice',
                    title: `Highest bid by ${this.auction.receiverAddress}`,
                };
            }
            if (this.isUserLatestBidder) {
                return {
                    name: 'correct',
                    title: 'You are the highest bidder',
                };
            }
            return {
                name: 'inactive',
                title: `You are not the highest bidder`,
            };
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
    methods: {
        bid() {
            this.$emit('bid', { auctionIndex: this.auction.id, bid: this.bidAmount });
        },
    },
});
</script>
