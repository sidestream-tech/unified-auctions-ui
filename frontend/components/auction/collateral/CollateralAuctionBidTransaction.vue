<template>
    <div>
        <TextBlock title="Bid with DAI transaction" />
        <Alert
            v-if="!auctionTransaction.isActive"
            message="This auction is inactive and must be restarted"
            type="error"
        />
        <Alert v-if="auctionTransaction.isFinished" message="This auction is finished" type="error" />
        <CollateralAuctionBidTransactionTable
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
                :is-correct.sync="isWalletConnected"
                @connectWallet="$emit('connect')"
                @disconnectWallet="$emit('disconnect')"
            />
            <WalletVatDaiBalanceCheckPanel
                :wallet-dai="walletDai"
                :wallet-vat-dai="walletVatDai"
                :transaction-bid-amount="transactionBidAmount"
                :is-loading="isDepositingOrWithdrawing"
                :is-correct.sync="isEnoughDeposited"
                :disabled="!isWalletConnected"
                @manageVat="$emit('manageVat')"
            />
            <WalletAuthorizationCheckPanel
                :is-wallet-authorized="isWalletAuthorized"
                :wallet-address="walletAddress"
                :disabled="!isEnoughDeposited"
                :is-loading="isAuthorizing"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isWalletAuthorizedCorrect"
                @authorizeWallet="$emit('authorizeWallet')"
            />
            <CollateralAuthorizationCheckPanel
                :collateral-type="auctionTransaction.collateralType"
                :authorized-collaterals="authorisedCollaterals"
                :auth-transaction-fee-e-t-h="auctionTransaction.authTransactionFeeETH"
                :wallet-address="walletAddress"
                :disabled="!isWalletAuthorized"
                :is-loading="isAuthorizing"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isCollateralAuthorized"
                @authorizeCollateral="$emit('authorizeCollateral', auctionTransaction.collateralType)"
            />
        </div>
        <CollateralAuctionBidBlock
            class="mb-6"
            :fees="fees"
            :is-wallet-connected="isWalletConnected"
            :is-wallet-authed="isWalletAuthorizedCorrect"
            :is-collateral-authed="isCollateralAuthorized"
            :auction-transaction="auctionTransaction"
            :transaction-bid-amount="transactionBidAmount"
            :amount-to-receive="amountToReceive"
            :disabled="
                !auctionTransaction.isActive ||
                auctionTransaction.isFinished ||
                !isWalletConnected ||
                !isEnoughDeposited ||
                !isWalletAuthorizedCorrect ||
                !isCollateralAuthorized ||
                isAmountToReceiveUnknown
            "
            :is-loading="isExecuting"
            :is-explanations-shown="isExplanationsShown"
            @bidWithDai="$emit('bidWithDai', { id: auctionTransaction.id, bidAmountDai: transactionBidAmount })"
        />
        <WithdrawCollateralPanel
            :collateral-type="auctionTransaction.collateralType"
            :collateral-vat-balance="collateralVatBalance"
            :is-fetching="isFetchingCollateralVatBalance"
            :is-withdrawing="isDepositingOrWithdrawing"
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
import CollateralAuctionBidTransactionTable from './CollateralAuctionBidTransactionTable.vue';
import CollateralAuctionBidBlock from './CollateralAuctionBidBlock.vue';
import CollateralAuthorizationCheckPanel from '~/components/panels/CollateralAuthorizationCheckPanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import WalletVatDaiBalanceCheckPanel from '~/components/panels/WalletVatDaiBalanceCheckPanel.vue';
import WithdrawCollateralPanel from '~/components/panels/WithdrawCollateralPanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    components: {
        TextBlock,
        CollateralAuctionBidTransactionTable,
        CollateralAuctionBidBlock,
        Alert,
        CollateralAuthorizationCheckPanel,
        WalletAuthorizationCheckPanel,
        WalletConnectionCheckPanel,
        WalletVatDaiBalanceCheckPanel,
        WithdrawCollateralPanel,
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
            isWalletConnected: false,
            isEnoughDeposited: false,
            isWalletAuthorizedCorrect: false,
            isCollateralAuthorized: false,
        };
    },
    computed: {
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
        isAmountToReceiveUnknown(): boolean {
            return this.amountToReceive?.isNaN();
        },
        fees() {
            const fees = { 'Bid Transaction Fee': this.auctionTransaction.bidTransactionFeeETH };
            if (!this.isWalletAuthorizedCorrect) {
                fees['Wallet Authorization Fee'] = this.auctionTransaction.authTransactionFeeETH;
            }
            if (!this.isCollateralAuthorized) {
                fees['Collateral Authorization Fee'] = this.auctionTransaction.authTransactionFeeETH;
            }
            return fees;
        },
    },
});
</script>
