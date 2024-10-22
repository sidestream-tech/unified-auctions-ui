<template>
    <TextBlock class="flex flex-col space-y-1">
        <div class="flex w-full justify-between">
            <div>Auction Ends</div>
            <div class="RightInfo"><TimeTill :date="auctionTransaction.endDate" /></div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Amount</div>
            <div class="RightInfo">
                <FormatCurrency
                    :value="auctionTransaction.collateralAmount"
                    :currency="auctionTransaction.tokenName"
                />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Price</div>
            <div class="RightInfo">
                <PriceDropAnimation :auction="auctionTransaction" class="mr-1" />
                <FormatCurrency :value="auctionTransaction.approximateUnitPrice" :currency="profitToken" /> per
                <span class="uppercase">{{ auctionTransaction.tokenName }}</span>
            </div>
        </div>
        <MarketPriceSelection
            :auction-transaction="auctionTransaction"
            :market-id.sync="currentMarketId"
            :is-autorouting-enabled="isAutoroutingEnabled"
            :profit-token="profitToken"
            @update:toggleAutoRouterLoad="toggleAutoRouterLoad"
        />
        <div class="flex w-full justify-between">
            <div>Market Difference</div>
            <div class="RightInfo">
                <template v-if="auctionTransaction.isActive && marketUnitPriceToUnitPriceRatio">
                    <FormatMarketValue :value="marketUnitPriceToUnitPriceRatio" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Estimated Profitability Time</div>
            <div class="RightInfo">
                <TimeTillProfitable :auction="auctionTransaction" :market-id="currentMarketId" />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Transaction Gross Profit</div>
            <div class="RightInfo">
                <FormatCurrency
                    v-if="transactionGrossProfit"
                    show-sign
                    :value="transactionGrossProfit"
                    :currency="profitToken"
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
                    :currency="profitToken"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div class="font-extrabold">Transaction Net Profit</div>
            <div class="RightInfo">
                <FormatCurrency
                    v-if="transactionNetProfit"
                    show-sign
                    :value="transactionNetProfit"
                    :currency="profitToken"
                    class="font-extrabold"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
    </TextBlock>
</template>
<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import PriceDropAnimation from '~/components/auction/collateral/PriceDropAnimation.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import MarketPriceSelection from '~/components/auction/collateral/MarketPriceSelection.vue';
import TimeTillProfitable from '~/components/auction/collateral/TimeTillProfitable.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatMarketValue from '~/components/common/formatters/FormatMarketValue.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import { AuctionTransaction } from '~/../core/src/types';

export default Vue.extend({
    components: {
        PriceDropAnimation,
        FormatCurrency,
        MarketPriceSelection,
        TextBlock,
        TimeTill,
        FormatMarketValue,
        TimeTillProfitable,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        marketId: {
            type: String,
            default: '',
        },
        isAutoroutingEnabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            currentMarketId: '',
        };
    },
    computed: {
        profitToken(): string {
            const marketId = this.currentMarketId || this.auctionTransaction.suggestedMarketId;
            const route = this.auctionTransaction.marketDataRecords[marketId].route || [];
            const profitToken = route[route.length - 1];
            return profitToken || 'DAI';
        },
        marketUnitPriceToUnitPriceRatio(): BigNumber | undefined {
            if (!this.currentMarketId || !this.auctionTransaction.marketDataRecords) {
                return this.auctionTransaction.marketUnitPriceToUnitPriceRatio;
            }
            return this.auctionTransaction.marketDataRecords[this.currentMarketId].marketUnitPriceToUnitPriceRatio;
        },
        transactionGrossProfit(): BigNumber | undefined {
            if (!this.currentMarketId || !this.auctionTransaction.marketDataRecords) {
                return this.auctionTransaction.transactionGrossProfit;
            }
            return this.auctionTransaction.marketDataRecords[this.currentMarketId].transactionGrossProfit;
        },
        transactionNetProfit(): BigNumber | undefined {
            if (!this.currentMarketId || !this.auctionTransaction.marketDataRecords) {
                return this.auctionTransaction.transactionNetProfit;
            }
            return this.auctionTransaction.marketDataRecords[this.currentMarketId].transactionNetProfit;
        },
    },
    watch: {
        currentMarketId(): void {
            this.$emit('update:marketId', this.currentMarketId);
        },
    },
    methods: {
        toggleAutoRouterLoad(id: string): void {
            this.$emit('update:toggleAutoRouterLoad', id);
        },
    },
});
</script>

<style scoped>
.RightInfo {
    @apply text-right ml-2;
}
</style>
