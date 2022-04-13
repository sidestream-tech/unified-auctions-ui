<template>
    <div>
        <table class="Table">
            <tr>
                <th class="Heading">Fee Parameter</th>
                <th class="Heading">Value in ETH</th>
                <th class="Heading">Value in DAI</th>
            </tr>
            <tbody>
                <tr>
                    <td class="Body">
                        <span> Gas Price </span>
                    </td>
                    <td class="Body">
                        <span v-if="gasParameters && gasParameters.gasPrice"> {{ gasParameters.gasPrice }} ETH </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <span class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Max Priority Fee Per Gas </span>
                    </td>
                    <td class="Body">
                        <span v-if="gasParameters && gasParameters.maxPriorityFeePerGas">
                            {{ gasParameters.maxPriorityFeePerGas }} ETH
                        </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <span class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Max Fee Per Gas </span>
                    </td>
                    <td class="Body">
                        <span v-if="gasParameters && gasParameters.maxFeePerGas">
                            {{ gasParameters.maxFeePerGas }} ETH
                        </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <span class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Base Fee Per Gas </span>
                    </td>
                    <td class="Body">
                        <span v-if="baseFeePerGas"> {{ baseFeePerGas }} ETH </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <span class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Bidding Transaction Fee </span>
                    </td>
                    <td class="Body">
                        <span v-if="transactionFees"> {{ transactionFees.biddingTransactionFeeETH }} ETH </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <span v-if="transactionFees"> {{ transactionFees.biddingTransactionFeeDAI }} ETH </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Auth Transaction Fee </span>
                    </td>
                    <td class="Body">
                        <span v-if="transactionFees"> {{ transactionFees.authTransactionFeeETH }} ETH </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <span v-if="transactionFees"> {{ transactionFees.authTransactionFeeDAI }} ETH </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Restart Transaction Fee </span>
                    </td>
                    <td class="Body">
                        <span v-if="transactionFees"> {{ transactionFees.restartTransactionFeeETH }} ETH </span>
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <span class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import type { GasParameters, TransactionFees } from 'auctions-core/src/types';

export default Vue.extend({
    name: 'GasTable',
    components: {},
    props: {
        baseFeePerGas: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        gasParameters: {
            type: Object as Vue.PropType<GasParameters>,
            default: undefined,
        },
        transactionFees: {
            type: Object as Vue.PropType<TransactionFees>,
            default: undefined,
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
