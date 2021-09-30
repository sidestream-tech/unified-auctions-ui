<template>
    <div>
        <TextBlock title="Swap transaction" />
        <SwapTransactionTable :auction-transaction="auctionTransaction" class="mt-4" />
        <TextBlock v-if="isExplanationsShown" class="TextBlock mt-4 mb-8">
            Please note, the transaction fee is a suggested value based on the current gas prices on the market; the
            transaction outcome is also approximate, since it is extrapolated from the exchange rates and may change
            during the transaction. If you’re bidding with other participants at the same time, the one who pays a
            higher transaction fee has more chances to win the auction (for more, see
            <a
                target="_blank"
                href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#front-running"
            >
                front running</a
            >). In case your transaction will be rejected, it only results in the loss of the transaction fee.
        </TextBlock>
        <WalletBlock
            class="mb-6 lg:mb-0"
            :is-loading="isConnecting"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="$emit('connect')"
            @disconnectWallet="$emit('disconnect')"
        />
        <AuthorisationBlock
            class="mb-6 lg:mb-0"
            :disabled="!isConnected"
            :collateral-type="auctionTransaction.collateralType"
            :is-loading="isAuthorizing"
            :is-authorized="isAuthorised"
            :is-explanations-shown="isExplanationsShown"
            @authorize="$emit('authorize')"
        />
        <ExecutionBlock
            :disabled="!isAuthorised"
            :is-loading="isExecuting"
            :transaction-address="auctionTransaction.transactionAddress"
            :is-explanations-shown="isExplanationsShown"
            :collateral-type="auctionTransaction.collateralType"
            :transaction-fee="auctionTransaction.transactionFeeETH"
            @execute="$emit('execute')"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import WalletBlock from '~/components/transaction/WalletBlock.vue';
import AuthorisationBlock from '~/components/transaction/AuthorisationBlock.vue';
import ExecutionBlock from '~/components/transaction/ExecutionBlock.vue';
import SwapTransactionTable from '~/components/transaction/SwapTransactionTable.vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    name: 'SwapTransaction',
    components: {
        TextBlock,
        SwapTransactionTable,
        WalletBlock,
        AuthorisationBlock,
        ExecutionBlock,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        isConnecting: {
            type: Boolean,
            default: false,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isExecuting: {
            type: Boolean,
            default: false,
        },
        isAuthorised: {
            type: Boolean,
            default: false,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        isConnected(): boolean {
            return this.walletAddress !== null;
        },
    },
});
</script>
