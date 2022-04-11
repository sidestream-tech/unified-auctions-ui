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
        <WalletConnectionCheckPanel
            :wallet-address="walletAddress"
            :disabled="!auctionTransaction.isActive || auctionTransaction.isFinished"
            :is-loading="isConnecting"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="$emit('connect')"
            @disconnectWallet="$emit('disconnect')"
            @update:isCorrect="isConnected = $event"
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
        <WalletAuthorizationCheckPanel
            :is-wallet-authorized="isWalletAuthorized"
            :wallet-address="walletAddress"
            :disabled="!isEnoughDeposited"
            :is-loading="isAuthorizing"
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
            :is-loading="isAuthorizing"
            :is-explanations-shown="isExplanationsShown"
            @authorizeCollateral="$emit('authorizeCollateral', auctionTransaction.collateralType)"
        />
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
        <WithdrawCollateralBlock
            :collateral-type="auctionTransaction.collateralType"
            :collateral-vat-balance="collateralVatBalance"
            :is-withdrawing="isDepositingOrWithdrawing"
            :is-fetching="isFetchingCollateralVatBalance"
            :is-explanations-shown="isExplanationsShown"
            @fetchCollateralVatBalance="$emit('fetchCollateralVatBalance', $event)"
            @withdrawAllCollateralFromVat="$emit('withdrawAllCollateralFromVat', $event)"
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
import DepositBlock from './DepositBlock.vue';
import BidBlock from './BidBlock.vue';
import WithdrawCollateralBlock from './WithdrawCollateralBlock.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import CollateralAuthorizationCheckPanel from '~/components/panels/CollateralAuthorizationCheckPanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BidTransactionTable,
        DepositBlock,
        BidBlock,
        WithdrawCollateralBlock,
        Alert,
        CollateralAuthorizationCheckPanel,
        WalletAuthorizationCheckPanel,
        WalletConnectionCheckPanel,
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
        };
    },
    computed: {
        isCollateralAuthorized(): boolean {
            return this.authorisedCollaterals.includes(this.auctionTransaction.collateralType);
        },
        isEnoughDeposited(): boolean {
            return this.walletVatDai?.isGreaterThanOrEqualTo(this.transactionBidAmount);
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
