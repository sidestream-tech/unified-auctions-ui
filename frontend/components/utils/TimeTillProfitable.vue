<template>
    <time-till :date="timeTillProfitable" />
</template>

<script lang="ts">
import Vue from 'vue';
import { AuctionTransaction } from '~/../core/src/types';
import TimeTill from '~/components/common/TimeTill.vue';
import { timeTillProfitable } from '~/helpers/tillDuration';

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
            timeTill.setSeconds(timeTill.getSeconds() + timeTillProfitable(this.auction));
            return timeTill;
        },
    },
});
</script>
