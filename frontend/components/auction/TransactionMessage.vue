<template>
    <TextBlock>
        <div v-if="transactionAddress">
            Transaction <format-address shorten :value="transactionAddress" /> was successfully executed.
            <format-address explicit :value="transactionAddress" />
        </div>
        <div v-else-if="isExplanationsShown">
            Auction bidding incurs a
            <Explain text="transaction fee" width="350px">
                <TransactionFeesTable :fees="fees" :combined-fees-eth="combinedFeesETH" />
            </Explain>
            of approximately
            <FormatCurrency v-if="combinedFeesETH" :value="combinedFeesETH" :decimals="5" currency="ETH" /><span
                v-else
                class="opacity-50"
                >Unknown ETH</span
            >, hence, the connected wallet needs to hold enough funds to cover these fees. The transaction fee is a
            recommended value and based on the
            <Explain text="average fast fee">
                <a href="https://ethereum.org/en/developers/docs/gas/#why-can-gas-fees-get-so-high" target="_blank">
                    Gas Prices can change
                </a>
                due to changing busyness of the Ethereum network. However, you can look up the current average gas
                price
                <a href="https://ethgasstation.info/" target="_blank"> here </a> </Explain
            >. The amount can be edited by the participant to influence the speed of the transaction.
            <div v-if="showDifferentWalletInfo" class="mt-2">
                By default, the profit from a successful bidding will be sent to the same wallet which executed the
                transaction. However, you can provide a different address which will receive the transaction profit.
            </div>
        </div>
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import Explain from '~/components/common/other/Explain.vue';
import TransactionFeesTable from '~/components/auction/TransactionFeesTable.vue';

export default Vue.extend({
    name: 'TransactionMessage',
    components: {
        TextBlock,
        FormatCurrency,
        FormatAddress,
        Explain,
        TransactionFeesTable,
    },
    props: {
        fees: {
            type: Object,
            default: undefined,
        },
        transactionAddress: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        showDifferentWalletInfo: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        combinedFeesETH(): BigNumber | undefined {
            if (!this.fees) {
                return undefined;
            }
            const reducer = (accumulator: BigNumber, curr: BigNumber) => {
                return accumulator.plus(curr);
            };
            return Object.values(this.fees).reduce(reducer);
        },
    },
});
</script>
