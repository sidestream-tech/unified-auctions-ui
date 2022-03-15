<template>
    <div class="flex flex-col space-y-1">
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
                        v-if="auctionTransaction.biddingTransactionFeeETH"
                        :value="auctionTransaction.biddingTransactionFeeETH"
                        :decimals="5"
                    />
                    <span v-else>Unknown</span>
                    ETH)
                </span>
            </div>
            <div>
                <FormatCurrency
                    v-if="auctionTransaction.biddingTransactionFeeDAI"
                    :value="auctionTransaction.biddingTransactionFeeDAI * -1"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <button
                class="ClickableText"
                :disabled="!isActive || !auctionTransaction.totalPrice"
                @click="setAmountToBid(undefined)"
            >
                Buy all collateral
            </button>
            <button
                class="ClickableText"
                :disabled="!isActive || !auctionTransaction.totalPrice"
                @click="setAmountToBid(undefined)"
            >
                <format-currency
                    v-if="auctionTransaction.totalPrice && isActive"
                    :value="auctionTransaction.totalPrice"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </button>
        </div>
        <div class="flex justify-between">
            <button
                class="ClickableText"
                :disabled="!isActive || !minimumDepositDai"
                @click="setAmountToBid(minimumDepositDai)"
            >
                Set minimum bid
            </button>
            <button
                class="ClickableText"
                :disabled="!isActive || !minimumDepositDai"
                @click="setAmountToBid(minimumDepositDai)"
            >
                <format-currency v-if="minimumDepositDai && isActive" :value="minimumDepositDai" currency="DAI" />
                <div v-else class="opacity-50">Unknown</div>
            </button>
        </div>
        <div class="flex justify-between items-center">
            <div>The amount to bid</div>
            <div class="flex w-1/2 items-center space-x-2 justify-end -mr-1">
                <div v-if="amountToBid">
                    <button
                        class="text-primary hover:text-primary-light whitespace-nowrap"
                        @click="setAmountToBid(undefined)"
                    >
                        Reset To Total
                    </button>
                </div>
                <div class="w-full flex-shrink-0">
                    <bid-input
                        :amount-to-bid.sync="amountToBid"
                        :minimum-deposit-dai="minimumDepositDai"
                        :total-price="auctionTransaction.totalPrice"
                        :disabled="auctionTransaction.isFinished || !auctionTransaction.isActive"
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
        minimumDepositDai: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
    },
    data() {
        return {
            amountToBid: undefined as BigNumber | undefined,
        };
    },
    computed: {
        amountToReceive(): BigNumber | undefined {
            if (!this.amountToBid || !this.auctionTransaction.approximateUnitPrice) {
                return this.auctionTransaction.collateralAmount;
            }
            return this.amountToBid.dividedBy(this.auctionTransaction.approximateUnitPrice);
        },
        isActive(): boolean {
            return this.auctionTransaction.isActive && !this.auctionTransaction.isFinished;
        },
        isBidAmountNaN(): boolean {
            return !!this.amountToBid?.isNaN();
        },
    },
    methods: {
        setAmountToBid(value: BigNumber | undefined) {
            if (this.isActive) {
                this.amountToBid = value;
            }
        },
    },
});
</script>

<style scoped>
.ClickableText:enabled {
    @apply text-primary hover:text-primary-light;
}

.ClickableText:enabled:first-of-type {
    @apply underline;
}
</style>
