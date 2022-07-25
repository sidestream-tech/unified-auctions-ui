<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div v-for="(value, key) in fees" :key="key" class="flex justify-between">
            <div>{{ key }}</div>
            <div>
                <FormatCurrency :value="value" :decimals="5" currency="ETH" />
            </div>
        </div>
        <hr v-if="isWalletConnected" />
        <div v-if="isWalletConnected" class="flex justify-between font-bold">
            <div>Remaining</div>
            <div>
                <FormatCurrency :value="combinedFeesETH" :decimals="5" currency="ETH" />
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
            default: null,
        },
        combinedFeesETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isWalletConnected: {
            type: Boolean,
            default: false,
        },
        isWalletAuthed: {
            type: Boolean,
            default: false,
        },
        isCollateralAuthed: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
