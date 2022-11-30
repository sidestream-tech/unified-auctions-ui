<template>
    <div>
        <div v-if="transactionGrossProfitDate">
            <TimeTill v-if="isProfitableBeforeEnding" :date="transactionGrossProfitDate" />
            <div v-else>Likely will not be profitable</div>
        </div>
        <div v-else-if="isAlreadyProfitable">Auction is profitable</div>
        <span v-else class="opacity-50">Unknown</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { AuctionTransaction } from 'auctions-core/src/types';
import TimeTill from '~/components/common/formatters/TimeTill.vue';

export default Vue.extend({
    components: {
        TimeTill,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        marketId: {
            type: String,
            default: '',
        },
    },
    computed: {
        transactionGrossProfitDate(): Date | undefined {
            if (!this.marketId || !this.auction.marketDataRecords) {
                return this.auction.transactionGrossProfitDate;
            }
            return this.auction.marketDataRecords[this.marketId].transactionGrossProfitDate;
        },
        marketUnitPrice(): BigNumber | undefined {
            if (!this.marketId || !this.auction.marketDataRecords) {
                return this.auction.marketUnitPrice;
            }
            return this.auction.marketDataRecords[this.marketId].marketUnitPrice;
        },
        isProfitableBeforeEnding(): boolean {
            if (!this.transactionGrossProfitDate) {
                return false;
            }
            return this.auction.endDate > this.transactionGrossProfitDate;
        },
        isAlreadyProfitable(): boolean {
            if (!this.marketUnitPrice) {
                return false;
            }
            return this.auction.approximateUnitPrice.isLessThan(this.marketUnitPrice);
        },
    },
});
</script>
