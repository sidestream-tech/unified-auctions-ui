<template>
    <div>
        <span v-if="state === 'collected'"> Collected </span>
        <span v-else-if="state === 'requires-restart'"> Requires Restart </span>
        <span v-else-if="state === 'ready-for-collection'"> Collectable since </span>
        <span v-else> Ends in </span>
        <TimeTill v-if="state !== 'requires-restart'" :date="endDate" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SurplusAuctionStates } from 'auctions-core/src/types';
import TimeTill from '~/components/common/formatters/TimeTill.vue';

export default Vue.extend({
    name: 'SurplusAuctionState',
    components: {
        TimeTill,
    },
    props: {
        state: {
            type: String as Vue.PropType<SurplusAuctionStates>,
            required: true,
        },
        endDate: {
            type: [String, Number, Date],
            default: '',
        },
    },
});
</script>
