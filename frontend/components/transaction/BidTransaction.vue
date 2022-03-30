<template>
    <div>
        <TextBlock title="Bid with DAI transaction" />
        <Alert
            v-if="!auctionTransaction.isActive"
            message="This auction is inactive and must be restarted"
            type="error"
        />
        <Alert v-if="auctionTransaction.isFinished" message="This auction is finished" type="error" />
        <BidTransactionTable
            class="mt-4 mb-6"
            :auction-transaction="auctionTransaction"
            :amount-to-receive="amountToReceive"
            @inputBidAmount="inputBidAmount = $event"
        />
        <WalletBlock
            class="mb-6 lg:mb-0"
            :disabled="!auctionTransaction.isActive || auctionTransaction.isFinished"
            :is-loading="isConnecting"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="$emit('connect')"
            @disconnectWallet="$emit('disconnect')"
        />
        <DepositBlock
            class="mb-6 lg:mb-0"
            :disabled="!auctionTransaction.isActive || !isConnected"
            :is-loading="isDepositingOrWithdrawing"
            :is-explanations-shown="isExplanationsShown"
            :transaction-bid-amount="transactionBidAmount"
            :wallet-dai="walletDai"
            :wallet-vat-dai="walletVatDai"
            @manageVat="$emit('manageVat')"
        />
        <AuthorisationBlock
            class="mb-6 lg:mb-0"
            :disabled="!isEnoughDeposited || !auctionTransaction.isActive || !isConnected"
            :auction-transaction="auctionTransaction"
            :is-loading="isAuthorizing"
            :is-wallet-authorized="isWalletAuthorized"
            :is-collateral-authorised="isCollateralAuthorised"
            :is-explanations-shown="isExplanationsShown"
            @authorizeWallet="$emit('authorizeWallet')"
            @authorizeCollateral="$emit('authorizeCollateral', auctionTransaction.collateralType)"
        />
        <BidBlock
            :auction-transaction="auctionTransaction"
            :transaction-bid-amount="transactionBidAmount"
            :amount-to-receive="amountToReceive"
            :disabled="
                !auctionTransaction.isActive || !isWalletAuthorized || !isCollateralAuthorised || !isEnoughDeposited
            "
            :is-loading="isExecuting"
            :is-explanations-shown="isExplanationsShown"
            @bidWithDai="$emit('bidWithDai', { id: auctionTransaction.id, bidAmountDai: transactionBidAmount })"
        />
    </div>
</template>

<script lang="ts">
import type { AuctionTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import { calculateTransactionCollateralOutcome } from 'auctions-core/src/price';
import AuthorisationBlock from './AuthorisationBlock.vue';
import BidTransactionTable from './BidTransactionTable.vue';
import WalletBlock from './WalletBlock.vue';
import DepositBlock from './DepositBlock.vue';
import BidBlock from './BidBlock.vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BidTransactionTable,
        AuthorisationBlock,
        WalletBlock,
        DepositBlock,
        BidBlock,
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
        isDepositingOrWithdrawing: {
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
        isWalletAuthorized: {
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
        walletDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletVatDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            inputBidAmount: undefined as BigNumber | undefined,
        };
    },
    computed: {
        isConnected(): boolean {
            return this.walletAddress !== null;
        },
        isCollateralAuthorised(): boolean {
            return this.authorisedCollaterals.includes(this.auctionTransaction.collateralType);
        },
        isEnoughDeposited(): boolean {
            return this.walletVatDai?.isGreaterThanOrEqualTo(this.transactionBidAmount);
        },
        transactionBidAmount(): BigNumber {
            const output = this.inputBidAmount || this.auctionTransaction?.totalPrice || new BigNumber(NaN);
            return output;
        },
        amountToReceive(): BigNumber {
            return calculateTransactionCollateralOutcome(
                this.transactionBidAmount,
                this.auctionTransaction.approximateUnitPrice,
                this.auctionTransaction
            );
        },
    },
});
</script>
