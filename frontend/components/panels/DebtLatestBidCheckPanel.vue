<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="isExplanationsShown">
            In order to win the auction, participants can bid on the auction. In case someone else puts the bid with a
            lower compensation, you receive your DAI back, only loosing the transaction fee.
        </TextBlock>

        <div class="flex justify-between my-3">
            <span>
                Latest bid placed
                <span v-if="auction.receiverAddress"
                    >by <FormatAddress :value="auction.receiverAddress" type="address" shorten
                /></span>
                asked for
            </span>
            <span v-if="!wasThereAnyBids" class="text-gray-400"> Unknown </span>
            <FormatCurrency v-else :value="auction.receiveAmountMKR" currency="MKR" />
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
                    >Bid <FormatCurrency :value="auction.bidAmountDai" currency="DAI" /> for
                    <FormatCurrency :value="desiredMkrAmount" currency="MKR"
                /></span>
                <span v-else>Unknown</span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { DebtAuction } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

export default Vue.extend({
    name: 'DebtLatestBidCheckPanel',
    components: {
        FormatCurrency,
        BaseButton,
        TextBlock,
        BasePanel,
        FormatAddress,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<DebtAuction>,
            default: null,
            required: true,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        desiredMkrAmount: {
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
            return ['have-bids', 'ready-for-collection', 'collected'].includes(this.auction.state);
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
                        title: 'You are the latest bidder',
                    };
                }
                return {
                    name: 'notice',
                    title: `Latest bid by ${this.auction.receiverAddress}`,
                };
            }
            if (this.isUserLatestBidder) {
                return {
                    name: 'correct',
                    title: 'You are the latest bidder',
                };
            }
            return {
                name: 'inactive',
                title: `You are not the latest bidder`,
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
            this.$emit('bid', { auctionIndex: this.auction.id, desiredMkrAmount: this.desiredMkrAmount });
        },
    },
});
</script>
