<template>
    <Loading :is-loading="isLoading" :error="error">
        <TextBlock>
            <table class="Table">
                <tr>
                    <th class="Heading">Transaction</th>
                    <th class="Heading">Type</th>
                    <th class="Heading">Wallet</th>
                    <th class="Heading">Amount</th>
                    <th class="Heading">When</th>
                </tr>
                <td v-if="!events" colspan="5" class="text-center py-4">No events were found</td>
                <tbody>
                    <tr v-for="(event, index) in events" :key="index">
                        <td class="Body">
                            <FormatAddress type="tx" :value="event.transactionAddress" :shorten="true" />
                        </td>
                        <td class="Body capitalize">
                            <span> {{ event.type }} </span>
                        </td>
                        <td class="Body">
                            <FormatAddress type="address" :value="event.walletAddress" :shorten="true" />
                            <span v-if="event.walletAddress === userWalletAddress">(You)</span>
                        </td>
                        <td class="Body">
                            <FormatCurrency v-if="event.amount" :value="event.amount" currency="MKR" />
                        </td>
                        <td class="Body">
                            <TimeTill :date="event.date" />
                        </td>
                    </tr>
                </tbody>
            </table>
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
    name: 'SurplusEventTable',
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
