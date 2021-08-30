<template>
    <div>
        <div class="text-xl font-extrabold mb-4 text-gray-700">Swap transaction</div>
        <SwapTransactionTable :auction-transaction="auctionTransaction" class="mb-10" />
        <WalletBlock
            :is-loading="isConnecting"
            :wallet-address="walletAddress"
            @connectWallet="$emit('connect')"
            @disconnectWallet="$emit('disconnect')"
        />
        <AuthorisationBlock
            :disabled="!isConnected"
            :collateral-type="auctionTransaction.collateralType"
            :is-loading="isAuthorizing"
            :is-authorized="isAuthorised"
            @authorize="$emit('authorize')"
        />
        <ExecutionBlock
            :disabled="!isAuthorised"
            :is-loading="isExecuting"
            :transaction-address="transactionAddress"
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

export default Vue.extend({
    name: 'SwapTransaction',
    components: {
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
        transactionAddress: {
            type: String,
            default: null,
        },
    },
    computed: {
        isConnected(): boolean {
            return this.walletAddress !== null;
        },
    },
});
</script>
