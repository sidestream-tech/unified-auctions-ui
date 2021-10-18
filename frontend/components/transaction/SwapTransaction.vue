<template>
    <div>
        <TextBlock title="Swap transaction" />
        <Alert
            v-if="!auctionTransaction.isActive"
            message="This auction is inactive and must be restarted"
            type="error"
        />
        <SwapTransactionTable :auction-transaction="auctionTransaction" class="mt-4" />
        <TextBlock class="TextBlock mt-4 mb-8">
            Please note, the transaction fee is a suggested value based on the current gas prices on the market; the
            transaction outcome is also approximate, since it is extrapolated from the exchange rates and may change
            during the transaction. If you’re bidding with other participants at the same time, the one who pays a
            higher transaction fee has
            <Explain text="more chances to win">
                For transactions that need to get preferentially executed ahead of other transactions
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#front-running"
                    target="_blank"
                >
                    in the same block</a
                >, a
                <a
                    href="https://ethereum.org/en/developers/docs/gas/#:~:text=10302608.6%20gwei-,Priority%20fee%20(tips),-Before%20the%20London"
                    target="_blank"
                >
                    higher tip
                </a>
                will be necessary to attempt to outbid competing transactions
            </Explain>
            the auction. In case your transaction will be rejected, it only results in the loss of the transaction fee.
        </TextBlock>
        <WalletBlock
            class="mb-6 lg:mb-0"
            :disabled="!auctionTransaction.isActive"
            :is-loading="isConnecting"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="$emit('connect')"
            @disconnectWallet="$emit('disconnect')"
        />
        <AuthorisationBlock
            class="mb-6 lg:mb-0"
            :disabled="!isConnected || !auctionTransaction.isActive"
            :auction-transaction="auctionTransaction"
            :is-loading="isAuthorizing"
            :is-wallet-authorised="isWalletAuthorised"
            :is-collateral-authorised="isCollateralAuthorised"
            :is-explanations-shown="isExplanationsShown"
            @authorizeWallet="$emit('authorizeWallet')"
            @authorizeCollateral="$emit('authorizeCollateral', auctionTransaction.collateralType)"
        />
        <ExecutionBlock
            :disabled="!isCollateralAuthorised || !isWalletAuthorised || !auctionTransaction.isActive"
            :is-loading="isExecuting"
            :transaction-address="auctionTransaction.transactionAddress"
            :is-explanations-shown="isExplanationsShown"
            :collateral-type="auctionTransaction.collateralType"
            :transaction-fee="auctionTransaction.biddingTransactionFeeETH"
            @execute="$emit('execute')"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import WalletBlock from '~/components/transaction/WalletBlock.vue';
import AuthorisationBlock from '~/components/transaction/AuthorisationBlock.vue';
import ExecutionBlock from '~/components/transaction/ExecutionBlock.vue';
import SwapTransactionTable from '~/components/transaction/SwapTransactionTable.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    name: 'SwapTransaction',
    components: {
        Explain,
        TextBlock,
        SwapTransactionTable,
        WalletBlock,
        AuthorisationBlock,
        ExecutionBlock,
        Alert,
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
        isWalletAuthorised: {
            type: Boolean,
            default: false,
        },
        authorisedCollaterals: {
            type: Array as Vue.PropType<string[]>,
            default: () => [],
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
        isCollateralAuthorised(): boolean {
            return this.authorisedCollaterals.includes(this.auctionTransaction.collateralType);
        },
    },
});
</script>
