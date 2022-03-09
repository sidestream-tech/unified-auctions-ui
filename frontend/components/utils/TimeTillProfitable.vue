<template>
    <div>
        <div v-if="auction.transactionGrossProfitDate">
            <time-till v-if="isProfitableBeforeEnding" :date="auction.transactionGrossProfitDate" />
            <div v-else>Likely will not be profitable</div>
        </div>
        <div v-else-if="isAlreadyProfitable">Auction is profitable</div>
        <span v-else class="opacity-50">Unknown</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AuctionTransaction } from 'auctions-core/src/types';
import TimeTill from '~/components/common/TimeTill.vue';

export default Vue.extend({
    components: {
        TimeTill,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
    },
    computed: {
        isProfitableBeforeEnding(): boolean {
            if (!this.auction.transactionGrossProfitDate) {
                return false;
            }
            return this.auction.endDate > this.auction.transactionGrossProfitDate;
        },
        isAlreadyProfitable(): boolean {
            if (!this.auction.marketUnitPrice) {
                return false;
            }
            return this.auction.approximateUnitPrice.isLessThan(this.auction.marketUnitPrice);
        },
    },
});
</script>
