<template>
    <div>
        <table class="Table">
            <tr>
                <th class="Heading">Fee Parameter</th>
                <th class="Heading">Value</th>
                <th class="Heading">Value in DAI</th>
            </tr>
            <tbody>
                <tr>
                    <td class="Body">
                        <span> Gas Price </span>
                    </td>
                    <td class="Body">
                        <FormatCurrency
                            v-if="gasParameters && gasParameters.gasPrice"
                            :value="parseGasParameters(gasParameters.gasPrice)"
                            currency="GWEI"
                        />
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
                        <FormatCurrency
                            v-if="gasParameters && gasParameters.maxPriorityFeePerGas"
                            :value="parseGasParameters(gasParameters.maxPriorityFeePerGas)"
                            currency="GWEI"
                        />
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
                        <FormatCurrency
                            v-if="gasParameters && gasParameters.maxFeePerGas"
                            :value="parseGasParameters(gasParameters.maxFeePerGas)"
                            currency="GWEI"
                        />
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
                        <FormatCurrency v-if="baseFeePerGas" :value="baseFeePerGas" currency="GWEI" />
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
                        <FormatCurrency
                            v-if="transactionFees"
                            :value="transactionFees.swapTransactionFeeETH"
                            currency="ETH"
                        />
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <FormatCurrency
                            v-if="transactionFees"
                            :value="transactionFees.swapTransactionFeeDAI"
                            currency="DAI"
                        />
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Auth Transaction Fee </span>
                    </td>
                    <td class="Body">
                        <FormatCurrency
                            v-if="transactionFees"
                            :value="transactionFees.authTransactionFeeETH"
                            currency="ETH"
                        />
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <FormatCurrency
                            v-if="transactionFees"
                            :value="transactionFees.authTransactionFeeDAI"
                            currency="DAI"
                        />
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                </tr>
                <tr>
                    <td class="Body">
                        <span> Restart Transaction Fee </span>
                    </td>
                    <td class="Body">
                        <FormatCurrency
                            v-if="transactionFees"
                            :value="transactionFees.restartTransactionFeeETH"
                            currency="ETH"
                        />
                        <span v-else class="UnknownValue"> Unknown </span>
                    </td>
                    <td class="Body">
                        <FormatCurrency
                            v-if="transactionFees"
                            :value="transactionFees.restartTransactionFeeDAI"
                            currency="DAI"
                        />
                        <span v-else class="UnknownValue"> Unknown </span>
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
import { GWEI_NUMBER_OF_DIGITS } from 'auctions-core/src/constants/UNITS';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    name: 'GasTable',
    components: { FormatCurrency },
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
    methods: {
        parseGasParameters(value: any): BigNumber {
            try {
                return new BigNumber(value).shiftedBy(-GWEI_NUMBER_OF_DIGITS);
            } catch (error) {
                return new BigNumber(NaN);
            }
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
