<template>
    <div class="flex flex-col space-y-1">
        <div class="flex w-full justify-between">
            <div>Expires in</div>
            <div><time-till :date="auctionTransaction.till" /></div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Amout</div>
            <div>
                <FormatCurrency :value="auctionTransaction.amountRAW" :currency="auctionTransaction.collateralType" />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Auction Price</div>
            <div>
                <FormatCurrency :value="auctionTransaction.amountPerCollateral" currency="DAI" /> per
                <span class="uppercase">{{ auctionTransaction.collateralType }}</span>
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Market value*</div>
            <div>
                <FormatMarketValue :value="auctionTransaction.marketValue" />
            </div>
        </div>
        <div class="flex w-full justify-between">
            <div>Potential profit</div>
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
            <div class="font-extrabold">Transaction outcome</div>
            <div class="font-extrabold">
                <FormatCurrency show-sign :value="auctionTransaction.transactionOutcome" currency="DAI" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import TimeTill from '~/components/common/TimeTill.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';

export default Vue.extend({
    components: {
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
