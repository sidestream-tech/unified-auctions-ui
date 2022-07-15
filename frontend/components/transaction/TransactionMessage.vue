<template>
    <TextBlock>
        <div v-if="transactionAddress">
            Transaction <format-address shorten :value="transactionAddress" /> was successfully executed.
            <format-address explicit :value="transactionAddress" />
        </div>
        <div v-else-if="isExplanationsShown">
            Auction bidding incurs a
            <Explain text="transaction fee" set-width="300px">
                <TransactionFeesTable
                    :is-wallet-connected="isWalletConnected"
                    :is-wallet-authed="isWalletAuthed"
                    :is-collateral-authed="isCollateralAuthed"
                    :swap-transaction-fee-e-t-h="swapTransactionFeeETH"
                    :bid-transaction-fee-e-t-h="bidTransactionFeeETH"
                    :auth-transaction-fee-e-t-h="authTransactionFeeETH"
                    :combined-swap-fees-e-t-h="combinedSwapFeesETH"
                    :combined-bid-fees-e-t-h="combinedBidFeesETH"
                />
            </Explain>
            of approximately
            <FormatCurrency :value="combinedSwapFeesETH" :decimals="5" currency="ETH" />, hence, the connected wallet
            needs to hold enough funds to cover these fees. The transaction fee is a recommended value and based on the
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
import TextBlock from '~/components/common/TextBlock.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import Explain from '~/components/utils/Explain.vue';
import TransactionFeesTable from '~/components/transaction/TransactionFeesTable.vue';

export default Vue.extend({
    components: {
        TextBlock,
        FormatCurrency,
        FormatAddress,
        Explain,
        TransactionFeesTable,
    },
    props: {
        swapTransactionFeeETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        bidTransactionFeeETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        authTransactionFeeETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        combinedSwapFeesETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        combinedBidFeesETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        transactionAddress: {
            type: String,
            default: null,
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
        showDifferentWalletInfo: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
