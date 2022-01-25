<template>
    <time-till v-if="isProfitableBeforeEnd" :date="timeTillProfitable" />
    <div v-else>Likely will not be profitable</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AuctionTransaction } from '~/../core/src/types';
import TimeTill from '~/components/common/TimeTill.vue';
import { calculateTimeTillProfitable } from '~/helpers/tillDuration';

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
        timeTillProfitable(): Date {
            const timeTill = this.startingDate;
            const seconds = calculateTimeTillProfitable(this.auction);
            timeTill.setSeconds(timeTill.getSeconds() + seconds);
            return timeTill;
        },
        isProfitableBeforeEnd(): boolean {
            return this.auction.endDate.getTime() > this.timeTillProfitable.getTime();
        },
    },
});
</script>
