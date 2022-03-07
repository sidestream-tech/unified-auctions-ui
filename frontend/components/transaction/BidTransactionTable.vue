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
                <PriceDropAnimation :auction="auctionTransaction" class="mr-1" />
                <FormatCurrency :value="auctionTransaction.approximateUnitPrice" currency="DAI" /> per
                <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
            </div>
        </div>
        <div class="flex justify-between">
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
        <div class="flex justify-between text-primary hover:text-primary-light cursor-pointer">
            <div class="underline">Auction total price</div>
            <div>
                <format-currency :value="auctionTransaction.totalPrice" currency="DAI" />
            </div>
        </div>
        <div class="flex justify-between text-primary hover:text-primary-light cursor-pointer">
            <div class="underline">Auction minimum bid</div>
            <div>
                <format-currency v-if="minimumDepositDAI" :value="minimumDepositDAI" currency="DAI" />
                <div v-else class="opacity-50">Unknown</div>
            </div>
        </div>
        <div class="flex justify-between">
            <div>The amount to bid</div>
            <div></div>
        </div>
        <div class="flex justify-between font-bold">
            <div>The amount to receive</div>
            <div>
                <format-currency
                    v-if="amountToReceive"
                    :value="amountToReceive"
                    :currency="auctionTransaction.collateralSymbol"
                />
                <div v-else>
                    <span class="opacity-50">UNKNOWN</span>
                    <span class="font-bold">{{ auctionTransaction.collateralSymbol }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import TimeTill from '~/components/common/TimeTill.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import PriceDropAnimation from '~/components/utils/PriceDropAnimation.vue';

export default Vue.extend({
    components: {
        TimeTill,
        FormatCurrency,
        PriceDropAnimation,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        minimumDepositDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        isFinished: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        amountToBid(): BigNumber | undefined {
            return undefined;
        },
        amountToReceive(): BigNumber | undefined {
            if (!this.amountToBid || !this.auctionTransaction.approximateUnitPrice) {
                return undefined;
            }
            return this.amountToBid.dividedBy(this.auctionTransaction.approximateUnitPrice);
        },
    },
});
</script>
