<template>
    <time-till v-if="isProfitableBeforeEnding" :date="auction.transactionProfitDate" />
    <div v-else>Likely will not be profitable</div>
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
    data() {
        return {
            startingDate: new Date(),
        };
    },
    computed: {
        isProfitableBeforeEnding(): boolean {
            if (!this.auction.transactionProfitDate) {
                return false;
            }
            return this.auction.endDate > this.auction.transactionProfitDate;
        },
    },
});
</script>
