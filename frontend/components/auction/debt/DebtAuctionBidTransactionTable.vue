<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div class="flex justify-between">
            <div>Auction State</div>
            <div>
                <time-till :date="auction.auctionEndDate" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Auction fixed bid</div>
            <div>
                <FormatCurrency v-if="auction.bidAmountDai" :value="auction.bidAmountDai" currency="DAI" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Current compensation</div>
            <div>
                <FormatCurrency v-if="auction.receiveAmountMKR" :value="auction.receiveAmountMKR" currency="MKR" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Next highest compensation</div>
            <button
                v-if="auction.nextMaximumLotReceived"
                class="ClickableText"
                :disabled="!isActive"
                @click="setInputBidAmount(undefined)"
            >
                <FormatCurrency :value="auction.nextMaximumLotReceived" currency="MKR" />
            </button>
            <span v-else class="opacity-50">Unknown</span>
        </div>
        <div class="flex justify-between items-center">
            <div>Desired compensation</div>
            <div class="flex w-1/2 items-center space-x-2 justify-end -mr-1">
                <div class="w-full flex-shrink-0">
                    <bid-input
                        :input-bid-amount.sync="inputBidAmount"
                        :min-value="auction.nextMaximumLotReceived"
                        :fallback-value="auction.nextMaximumLotReceived"
                        currency="MKR"
                        :disabled="!isActive"
                        :validator="validator"
                    />
                </div>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Combined Transaction Fees</div>
            <div>
                <FormatCurrency v-if="auction.combinedBidFeesDai" :value="auction.combinedBidFeesDai" currency="DAI" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Price on Uniswap</div>
            <div>
                <format-currency
                    v-if="auction.marketUnitPrice && isActive"
                    :value="auction.marketUnitPrice"
                    :decimal-places="6"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span> per MKR
            </div>
        </div>
        <div class="flex justify-between font-bold">
            <div>Price after the bid</div>
            <div>
                <format-currency
                    v-if="unitPriceAfterBid && isActive && !isBidAmountNaN"
                    :value="unitPriceAfterBid"
                    :decimal-places="6"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span> per MKR
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { DebtAuctionTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BidInput from '~/components/common/inputs/BidInput.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    components: {
        TimeTill,
        FormatCurrency,
        BidInput,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<DebtAuctionTransaction>,
            required: true,
        },
    },
    data() {
        return {
            inputBidAmount: undefined as BigNumber | undefined,
        };
    },
    computed: {
        isActive(): boolean {
            return this.auction.state === 'just-started' || this.auction.state === 'have-bids';
        },
        isBidAmountNaN(): boolean {
            return !!this.inputBidAmount?.isNaN();
        },
        unitPriceAfterBid(): BigNumber | undefined {
            if (!this.isActive) {
                return undefined;
            }
            if (!this.inputBidAmount) {
                return this.auction.nextMaximumLotReceived.dividedBy(this.auction.receiveAmountMKR || 1);
            }
            return this.inputBidAmount.dividedBy(this.auction.receiveAmountMKR || 1);
        },
    },
    watch: {
        inputBidAmount: {
            immediate: true,
            handler(inputBidAmount) {
                this.$emit('inputBidAmount', inputBidAmount);
            },
        },
    },
    methods: {
        setInputBidAmount(value: BigNumber | undefined) {
            if (this.isActive) {
                this.inputBidAmount = value;
            }
        },
        validator(currentValue: BigNumber | undefined, minValue: BigNumber | undefined) {
            if (currentValue?.isGreaterThan(minValue)) {
                throw new Error('The value cannot be higher than the next highest compensation');
            }
        },
    },
});
</script>

<style scoped>
.ClickableText:enabled {
    @apply text-primary hover:text-primary-light;
}

.ClickableText:disabled {
    @apply pointer-events-none;
}

.ClickableText:enabled:first-of-type {
    @apply underline;
}
</style>
