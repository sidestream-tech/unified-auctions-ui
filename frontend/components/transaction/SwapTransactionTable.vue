<template>
    <TextBlock class="flex flex-col space-y-1">
        <div class="flex w-full justify-between">
            <div>Auction Ends</div>
            <div><time-till :date="auctionTransaction.endDate" /></div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Amount</div>
            <div>
                <FormatCurrency
                    :value="auctionTransaction.collateralAmount"
                    :currency="auctionTransaction.collateralSymbol"
                />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Price</div>
            <div>
                <PriceDropAnimation :auction="auctionTransaction" class="mr-1" />
                <FormatCurrency :value="auctionTransaction.approximateUnitPrice" currency="DAI" /> per
                <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Price On Uniswap</div>
            <div>
                <template v-if="auctionTransaction.isActive && auctionTransaction.marketUnitPrice">
                    <FormatCurrency :value="auctionTransaction.marketUnitPrice" currency="DAI" /> per
                    <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Market Difference</div>
            <div>
                <template v-if="auctionTransaction.isActive && auctionTransaction.marketUnitPriceToUnitPriceRatio">
                    <FormatMarketValue :value="auctionTransaction.marketUnitPriceToUnitPriceRatio" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div v-if="!isProfitable" class="flex w-full justify-between">
            <div>Estimated Profitability Time</div>
            <div>
                <template v-if="auctionTransaction.isActive && auctionTransaction.marketUnitPrice">
                    <time-till-profitable :auction="auctionTransaction" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Potential Profit</div>
            <div>
                <FormatCurrency
                    v-if="auctionTransaction.transactionProfit"
                    show-sign
                    :value="auctionTransaction.transactionProfit"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>
                Transaction Fee
                <span class="text-gray-300"
                    >(~<FormatCurrency
                        v-if="auctionTransaction.biddingTransactionFeeETH"
                        :value="auctionTransaction.biddingTransactionFeeETH"
                        :decimals="5"
                    />
                    <span v-else>Unknown</span>
                    ETH)</span
                >
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
        <div class="flex w-full justify-between">
            <div class="font-extrabold">Transaction Outcome</div>
            <div>
                <FormatCurrency
                    v-if="auctionTransaction.transactionProfitMinusFees"
                    show-sign
                    :value="auctionTransaction.transactionProfitMinusFees"
                    currency="DAI"
                    class="font-extrabold"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
    </TextBlock>
</template>
<script lang="ts">
import Vue from 'vue';
import PriceDropAnimation from '../utils/PriceDropAnimation.vue';
import TimeTillProfitable from '../utils/TimeTillProfitable.vue';
import TimeTill from '~/components/common/TimeTill.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        PriceDropAnimation,
        TextBlock,
        TimeTill,
        FormatCurrency,
        FormatMarketValue,
        TimeTillProfitable,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
    },
    computed: {
        isProfitable(): boolean {
            if (this.auctionTransaction.marketUnitPriceToUnitPriceRatio) {
                return this.auctionTransaction.marketUnitPriceToUnitPriceRatio.toNumber() < 0;
            }
            return false;
        },
    },
});
</script>
