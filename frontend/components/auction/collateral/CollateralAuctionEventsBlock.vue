<template>
    <div class="mt-5">
        <p class="mb-2">
            The auction was taken via {{ takeEvents.length }} transaction<span v-if="takeEvents.length !== 1">s</span>
            at {{ takeEvents[takeEvents.length - 1].transactionDate.toUTCString() }}.
        </p>
        <ul class="list-disc list-inside">
            <li v-for="event of takeEvents" :key="event.pastLiquidations[0].transactionHash">
                Transaction <FormatAddress :value="event.pastLiquidations[0].transactionHash" :shorten="true" />
                <span v-if="event.transactionDate"> executed <TimeTill :date="event.transactionDate" /> </span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TakeEvent } from 'auctions-core/src/types';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';

export default Vue.extend({
    name: 'CollateralAuctionEventsBlock',
    components: { FormatAddress, TimeTill },
    props: {
        takeEvents: {
            type: Array as Vue.PropType<TakeEvent[]>,
            required: true,
        },
    },
});
</script>
