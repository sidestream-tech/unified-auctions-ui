<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div class="flex justify-between">
            <div>Auction State</div>
            <div>
                <time-till :date="auction.auctionEndDate" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Auction Amount</div>
            <div>
                <FormatCurrency :value="auction.receiveAmountDAI" currency="DAI" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Current Highest Bid</div>
            <div>
                <FormatCurrency :value="auction.bidAmountMKR" currency="MKR" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Lowest Next Bid</div>
            <button class="ClickableText" :disabled="!isActive" @click="setInputBidAmount(undefined)">
                <FormatCurrency :value="lowestNextBid" currency="MKR" />
            </button>
        </div>
        <div class="flex justify-between items-center">
            <div>The Amount to Bid</div>
            <div class="flex w-1/2 items-center space-x-2 justify-end -mr-1">
                <div class="w-full flex-shrink-0">
                    <bid-input
                        :transaction-bid-amount.sync="inputBidAmount"
                        :min-value="lowestNextBid"
                        :fallback-value="lowestNextBid"
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
                <FormatCurrency v-if="auction.combinedBidFees" :value="auction.combinedBidFees" currency="DAI" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Price on Uniswap</div>
            <div>
                <format-currency
                    v-if="auction.marketUnitPrice && isActive"
                    :value="auction.marketUnitPrice"
                    currency="MKR"
                />
                <span v-else class="opacity-50">Unknown</span> per DAI
            </div>
        </div>
        <div class="flex justify-between font-bold">
            <div>Price after the bid</div>
            <div>
                <format-currency
                    v-if="unitPriceAfterBid && isActive && !isBidAmountNaN"
                    :value="unitPriceAfterBid"
                    currency="MKR"
                />
                <span v-else class="opacity-50">Unknown</span> per DAI
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { SurplusAuction } from 'auctions-core/src/types';
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BidInput from '../utils/BidInput.vue';
import TimeTill from '~/components/common/TimeTill.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    components: {
        TimeTill,
        FormatCurrency,
        BidInput,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuction>,
            required: true,
        },
        lowestNextBid: {
            type: Object as Vue.PropType<BigNumber>,
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
            return !!this.transactionBidAmount?.isNaN();
        },
        unitPriceAfterBid(): BigNumber | undefined {
            if (!this.transactionBidAmount) {
                return this.lowestNextBid.dividedBy(this.auction.receiveAmountDAI || 1);
            }
            return this.transactionBidAmount.dividedBy(this.auction.receiveAmountDAI || 1);
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
            if (currentValue?.isLessThan(minValue)) {
                throw new Error('The value cannot be lower than the lowest next bid');
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
