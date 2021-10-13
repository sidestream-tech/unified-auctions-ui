<template>
    <TextBlock class="flex flex-col space-y-1">
        <div class="flex w-full justify-between">
            <div>Expires In</div>
            <div><time-till :date="auctionTransaction.till" /></div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Amount</div>
            <div>
                <FormatCurrency
                    :value="auctionTransaction.amountRAW"
                    :currency="auctionTransaction.collateralSymbol"
                />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Price</div>
            <div>
                <FormatCurrency :value="auctionTransaction.amountPerCollateral" currency="DAI" /> per
                <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Price On Uniswap</div>
            <div>
                <FormatCurrency :value="auctionTransaction.marketPricePerCollateral" currency="DAI" /> per
                <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Market Difference</div>
            <div>
                <FormatMarketValue :value="auctionTransaction.marketValue" />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Potential Profit</div>
            <div><FormatCurrency show-sign :value="auctionTransaction.transactionProfit" currency="DAI" /></div>
        </div>
        <div class="flex w-full justify-between">
            <div>
                Transaction Fee
                <span class="text-gray-300"
                    >(<FormatCurrency
                        :value="auctionTransaction.transactionFeeETH"
                        :decimals="6"
                        currency="ETH"
                    />)</span
                >
            </div>
            <div>
                <FormatCurrency :value="auctionTransaction.transactionFeeDAI * -1" currency="DAI" />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div class="font-extrabold">Transaction Outcome</div>
            <div class="font-extrabold">
                <FormatCurrency show-sign :value="auctionTransaction.transactionOutcome" currency="DAI" />
            </div>
        </div>
    </TextBlock>
</template>
<script lang="ts">
import Vue from 'vue';
import TimeTill from '~/components/common/TimeTill.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        TextBlock,
        TimeTill,
        FormatCurrency,
        FormatMarketValue,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
    },
});
</script>
