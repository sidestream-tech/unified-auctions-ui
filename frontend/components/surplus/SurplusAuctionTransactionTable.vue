<template>
    <Loading :is-loading="isLoading" :error="error">
        <TextBlock>
            <table class="Table">
                <tr>
                    <th class="Heading">Transaction</th>
                    <th class="Heading">Bidder</th>
                    <th class="Heading">Amount</th>
                    <th class="Heading">When</th>
                </tr>
                <td v-if="!bidEvents || bidEvents.length === 0" colspan="5" class="text-center py-4">No bids yet</td>
                <tbody v-else>
                    <tr v-for="(event, index) in bidEvents.slice(0, 5)" :key="index">
                        <td class="Body">
                            <FormatAddress type="tx" :value="event.transactionHash" :shorten="true" />
                        </td>
                        <td class="Body">
                            <FormatAddress type="address" :value="event.address" :shorten="true" />
                            <span v-if="event.address === userWalletAddress" class="italic">(You)</span>
                        </td>
                        <td class="Body">
                            <FormatCurrency v-if="event.bidAmountMKR" :value="event.bidAmountMKR" currency="MKR" />
                        </td>
                        <td class="Body">
                            <TimeTill :date="event.transactionDate" :strict="true" />
                        </td>
                    </tr>
                    <template v-if="isTableExpanded && bidEvents.length > 5">
                        <tr v-for="(event, index) in bidEvents.slice(5)" :key="index">
                            <td class="Body">
                                <FormatAddress type="tx" :value="event.transactionHash" :shorten="true" />
                            </td>
                            <td class="Body">
                                <FormatAddress type="address" :value="event.address" :shorten="true" />
                                <span v-if="event.address === userWalletAddress" class="italic">(You)</span>
                            </td>
                            <td class="Body">
                                <FormatCurrency v-if="event.bidAmountMKR" :value="event.bidAmountMKR" currency="MKR" />
                            </td>
                            <td class="Body">
                                <TimeTill :date="event.transactionDate" />
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <button
                v-if="bidEvents && bidEvents.length > 5"
                class="
                    w-full
                    border-2 border-gray-300
                    p-1
                    border-t-0
                    text-center text-gray-400
                    dark:border-gray-600 dark:text-gray-600
                "
                @click="toggleExpandable"
            >
                {{ isTableExpanded ? 'Hide additional bids' : 'Show additional bids' }}
            </button>
        </TextBlock>
    </Loading>
</template>

<script lang="ts">
import Vue from 'vue';
import { SurplusEvent } from 'auctions-core/src/types';
import FormatAddress from '../utils/FormatAddress.vue';
import TextBlock from '../common/TextBlock.vue';
import FormatCurrency from '../utils/FormatCurrency.vue';
import TimeTill from '../common/TimeTill.vue';
import Loading from '../common/Loading.vue';

export default Vue.extend({
    name: 'SurplusAuctionTransactionTable',
    components: { Loading, TimeTill, FormatCurrency, TextBlock, FormatAddress },
    props: {
        events: {
            type: Array as Vue.PropType<SurplusEvent[]>,
            default: null,
        },
        userWalletAddress: {
            type: String,
            default: null,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        error: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            isTableExpanded: false,
        };
    },
    computed: {
        bidEvents() {
            if (!this.events) {
                return null;
            }
            return this.events
                .filter(event => {
                    return event.type === 'bid';
                })
                .reverse();
        },
    },
    methods: {
        toggleExpandable(): void {
            this.isTableExpanded = !this.isTableExpanded;
        },
    },
});
</script>

<style scoped>
.Table {
    @apply w-full border-2 border-gray-300 dark:border-gray-600 bg-transparent;
}

.Element {
    @apply p-2 h-8 border-r-2 border-b-2 border-gray-300 dark:border-gray-600;
}

.Body {
    @apply Element text-gray-500 dark:text-gray-300;
}

.Heading {
    @apply Element text-gray-700 dark:text-gray-100;
}

.UnknownValue {
    @apply text-gray-400;
}
</style>
