<template>
    <TextBlock class="flex flex-col space-y-1">
        <div class="flex w-full justify-between">
            <div>Auction Ends</div>
            <div class="RightInfo"><time-till :date="auctionTransaction.endDate" /></div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Amount</div>
            <div class="RightInfo">
                <FormatCurrency
                    :value="auctionTransaction.collateralAmount"
                    :currency="auctionTransaction.collateralSymbol"
                />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Price</div>
            <div class="RightInfo">
                <PriceDropAnimation :auction="auctionTransaction" class="mr-1" />
                <FormatCurrency :value="auctionTransaction.approximateUnitPrice" currency="DAI" /> per
                <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Price On Uniswap</div>
            <div class="RightInfo">
                <template v-if="auctionTransaction.isActive && auctionTransaction.marketUnitPrice">
                    <FormatCurrency :value="auctionTransaction.marketUnitPrice" currency="DAI" /> per
                    <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Market Difference</div>
            <div class="RightInfo">
                <template v-if="auctionTransaction.isActive && auctionTransaction.marketUnitPriceToUnitPriceRatio">
                    <FormatMarketValue :value="auctionTransaction.marketUnitPriceToUnitPriceRatio" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Estimated Profitability Time</div>
            <div class="RightInfo">
                <time-till-profitable :auction="auctionTransaction" />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Transaction Gross Profit</div>
            <div class="RightInfo">
                <FormatCurrency
                    v-if="auctionTransaction.transactionGrossProfit"
                    show-sign
                    :value="auctionTransaction.transactionGrossProfit"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>
                Combined Transactions Fees
                <span class="text-gray-300"
                    >(~<FormatCurrency
                        v-if="auctionTransaction.combinedSwapFeesETH"
                        :value="auctionTransaction.combinedSwapFeesETH"
                        :decimals="5"
                    />
                    <span v-else>Unknown</span>
                    ETH)</span
                >
            </div>
            <div class="RightInfo">
                <FormatCurrency
                    v-if="auctionTransaction.combinedSwapFeesDAI"
                    :value="auctionTransaction.combinedSwapFeesDAI * -1"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div class="font-extrabold">Transaction Net Profit</div>
            <div class="RightInfo">
                <FormatCurrency
                    v-if="auctionTransaction.transactionNetProfit"
                    show-sign
                    :value="auctionTransaction.transactionNetProfit"
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
import PriceDropAnimation from '~/components/auction/collateral/PriceDropAnimation.vue';
import TimeTillProfitable from '~/components/auction/collateral/TimeTillProfitable.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import FormatMarketValue from '~/components/common/formatters/FormatMarketValue.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import { AuctionTransaction } from '~/../core/src/types';

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
});
</script>

<style scoped>
.RightInfo {
    @apply text-right ml-2;
}
</style>
