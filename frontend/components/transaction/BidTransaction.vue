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
        <div class="mb-4">
            <WalletConnectionCheckPanel
                :wallet-address="walletAddress"
                :disabled="!auctionTransaction.isActive || auctionTransaction.isFinished"
                :is-loading="isConnecting"
                :is-explanations-shown="isExplanationsShown"
                @connectWallet="$emit('connect')"
                @disconnectWallet="$emit('disconnect')"
                @update:isCorrect="isConnected = $event"
            />
            <WalletVatDaiBalanceCheckPanel
                :wallet-dai="walletDai"
                :wallet-vat-dai="walletVatDai"
                :transaction-bid-amount="transactionBidAmount"
                :is-loading="isDepositingOrWithdrawing"
                :disabled="!isConnected"
                @manageVat="$emit('manageVat')"
                @update:isCorrect="isEnoughDeposited = $event"
            />
            <WalletAuthorizationCheckPanel
                :is-wallet-authorized="isWalletAuthorized"
                :wallet-address="walletAddress"
                :disabled="!isEnoughDeposited"
                :is-loading="isAuthorizingWallet"
                :is-explanations-shown="isExplanationsShown"
                @authorizeWallet="$emit('authorizeWallet')"
            />
            <CollateralAuthorizationCheckPanel
                :collateral-type="auctionTransaction.collateralType"
                :is-collateral-authorized="isCollateralAuthorized"
                :auth-transaction-fee-e-t-h="auctionTransaction.authTransactionFeeETH"
                :wallet-address="walletAddress"
                :is-wallet-authorized="isWalletAuthorized"
                :disabled="!isEnoughDeposited"
                :is-loading="isAuthorizingCollateral"
                :is-explanations-shown="isExplanationsShown"
                @authorizeCollateral="$emit('authorizeCollateral', auctionTransaction.collateralType)"
            />
        </div>
        <BidBlock
            class="mb-6 lg:mb-0"
            :auction-transaction="auctionTransaction"
            :transaction-bid-amount="transactionBidAmount"
            :amount-to-receive="amountToReceive"
            :disabled="
                !auctionTransaction.isActive ||
                auctionTransaction.isFinished ||
                !isWalletAuthorized ||
                !isCollateralAuthorized ||
                !isEnoughDeposited
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
import BidTransactionTable from './BidTransactionTable.vue';
import BidBlock from './BidBlock.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import CollateralAuthorizationCheckPanel from '~/components/panels/CollateralAuthorizationCheckPanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import WalletVatDaiBalanceCheckPanel from '~/components/panels/WalletVatDaiBalanceCheckPanel.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BidTransactionTable,
        BidBlock,
        Alert,
        CollateralAuthorizationCheckPanel,
        WalletAuthorizationCheckPanel,
        WalletConnectionCheckPanel,
        WalletVatDaiBalanceCheckPanel,
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
        isAuthorizingWallet: {
            type: Boolean,
            default: false,
        },
        isAuthorizingCollateral: {
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
        collateralVatBalance: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isFetchingCollateralVatBalance: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            inputBidAmount: undefined as BigNumber | undefined,
            isConnected: false,
            isEnoughDeposited: false,
        };
    },
    computed: {
        isCollateralAuthorized(): boolean {
            return this.authorisedCollaterals.includes(this.auctionTransaction.collateralType);
        },
        transactionBidAmount(): BigNumber {
            return this.inputBidAmount || this.auctionTransaction?.debtDAI || new BigNumber(NaN);
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
