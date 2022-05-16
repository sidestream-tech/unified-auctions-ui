<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div class="flex justify-between">
            <div>Auction Ends</div>
            <div>
                <time-till :date="auctionTransaction.endDate" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Auction Amount</div>
            <div>
                <FormatCurrency
                    :value="auctionTransaction.collateralAmount"
                    :currency="auctionTransaction.collateralSymbol"
                />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Auction Price</div>
            <div>
                <template v-if="auctionTransaction.isActive">
                    <PriceDropAnimation :auction="auctionTransaction" class="mr-1" />
                    <FormatCurrency :value="auctionTransaction.approximateUnitPrice" currency="DAI" /> per
                    <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>
                Transaction Fee
                <span class="text-gray-300">
                    (~
                    <FormatCurrency
                        v-if="auctionTransaction.combinedBidFeesETH"
                        :value="auctionTransaction.combinedBidFeesETH"
                        :decimals="5"
                    />
                    <span v-else>Unknown</span>
                    ETH)
                </span>
            </div>
            <div>
                <FormatCurrency
                    v-if="auctionTransaction.combinedBidFeesDAI"
                    :value="auctionTransaction.combinedBidFeesDAI * -1"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div v-if="auctionTransaction.minimumBidDai" class="flex justify-between">
            <div>Minimum leftover</div>
            <div>
                <format-currency :value="auctionTransaction.minimumBidDai" currency="DAI" />
            </div>
        </div>
        <div class="flex justify-between">
            <span v-if="!isActive || !auctionTransaction.debtDAI || isTooSmallToPartiallyTake">Auction debt</span>
            <button v-else class="ClickableText" @click="setTransactionBidAmount(undefined)">Set maximum bid</button>
            <button
                class="ClickableText"
                :disabled="!isActive || !auctionTransaction.debtDAI || isTooSmallToPartiallyTake"
                @click="setTransactionBidAmount(undefined)"
            >
                <format-currency
                    v-if="auctionTransaction.debtDAI && isActive"
                    :value="auctionTransaction.debtDAI"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </button>
        </div>
        <div class="flex justify-between items-center">
            <div>The amount to bid</div>
            <div class="flex w-1/2 items-center space-x-2 justify-end -mr-1">
                <div class="w-full flex-shrink-0">
                    <bid-input
                        :transaction-bid-amount.sync="transactionBidAmount"
                        :minimum-bid-dai="auctionTransaction.minimumBidDai"
                        :debt-dai="auctionTransaction.debtDAI"
                        :disabled="!isActive || isTooSmallToPartiallyTake"
                        :is-too-small-to-partially-take="isTooSmallToPartiallyTake"
                    />
                </div>
            </div>
        </div>
        <div class="flex justify-between font-bold">
            <div>The amount to receive</div>
            <div>
                <format-currency
                    v-if="amountToReceive && isActive && !isBidAmountNaN"
                    :value="amountToReceive"
                    :currency="auctionTransaction.collateralSymbol"
                />
                <div v-else>
                    <span class="opacity-50">Unknown</span>
                    <span class="font-bold">{{ auctionTransaction.collateralSymbol }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { AuctionTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BidInput from '../utils/BidInput.vue';
import TimeTill from '~/components/common/TimeTill.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import PriceDropAnimation from '~/components/utils/PriceDropAnimation.vue';

export default Vue.extend({
    components: {
        TimeTill,
        FormatCurrency,
        PriceDropAnimation,
        BidInput,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        amountToReceive: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
    },
    data() {
        return {
            transactionBidAmount: undefined as BigNumber | undefined,
        };
    },
    computed: {
        isActive(): boolean {
            return this.auctionTransaction.isActive && !this.auctionTransaction.isFinished;
        },
        isBidAmountNaN(): boolean {
            return !!this.transactionBidAmount?.isNaN();
        },
        isTooSmallToPartiallyTake(): boolean {
            return this.auctionTransaction.debtDAI.isLessThanOrEqualTo(this.auctionTransaction.minimumBidDai);
        },
    },
    watch: {
        transactionBidAmount: {
            immediate: true,
            handler(transactionBidAmount) {
                this.$emit('inputBidAmount', transactionBidAmount);
            },
        },
    },
    methods: {
        setTransactionBidAmount(value: BigNumber | undefined) {
            if (this.isActive) {
                this.transactionBidAmount = value;
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
