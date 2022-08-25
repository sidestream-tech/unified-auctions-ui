<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div v-for="(value, key) in fees" :key="key" class="flex justify-between">
            <div>{{ key }}</div>
            <div>
                <FormatCurrency :value="value" :decimals="5" currency="ETH" />
            </div>
        </div>
        <hr v-if="combinedFeesEth" />
        <div class="flex justify-between font-bold">
            <div>Total</div>
            <div>
                <FormatCurrency v-if="combinedFeesEth" :value="combinedFeesEth" :decimals="5" currency="ETH" />
                <span v-else>Unknown ETH</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    name: 'TransactionFeesTable',
    components: {
        FormatCurrency,
    },
    props: {
        fees: {
            type: Object,
            default: undefined,
        },
        combinedFeesEth: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
    },
});
</script>
