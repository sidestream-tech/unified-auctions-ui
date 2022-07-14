<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div class="flex justify-between">
            <div>Swap Transaction Fee</div>
            <div>
                <FormatCurrency :value="auctionTransaction.swapTransactionFeeETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
        <div v-if="!isWalletAuthorized" class="flex justify-between">
            <div>Wallet Authorization Fee</div>
            <div>
                <FormatCurrency :value="auctionTransaction.authTransactionFeeETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
        <div v-if="!isCollateralAuthorized" class="flex justify-between">
            <div>Collateral Authorization Fee</div>
            <div>
                <FormatCurrency :value="auctionTransaction.authTransactionFeeETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
        <hr />
        <div class="flex justify-between font-bold">
            <div>Total</div>
            <div>
                <FormatCurrency :value="auctionTransaction.combinedSwapFeesETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import { AuctionTransaction } from '~/../core/src/types';

export default Vue.extend({
    components: {
        FormatCurrency,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        isCollateralAuthorized: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
