<template>
    <div>
        <TextBlock title="Swap transaction" />
        <SwapTransactionTable :auction-transaction="auctionTransaction" class="mt-4" />
        <TextBlock class="TextBlock mt-4 mb-8">
            Please note that the transaction fee, as well as the potential profit, are approximate numbers. The
            transaction fee will be charged even if the swap fails, since computational power was used. Failure can
            happen in the case of other market participants trying to swap at the same time willing to pay more
            transaction fees. Meaning their swap is executed first. This risk is called
            <a
                target="_blank"
                href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#front-running"
                >front-running.</a
            >
        </TextBlock>
        <WalletBlock
            :is-loading="isConnecting"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="$emit('connect')"
            @disconnectWallet="$emit('disconnect')"
        />
        <AuthorisationBlock
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
