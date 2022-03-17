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
            :auction-transaction="auctionTransaction"
            :minimum-deposit-dai="minimumBidDai"
            class="mt-4 mb-6"
            @inputBidAmount="$emit('inputBidAmount', $event)"
        />
        <WalletBlock
            class="mb-6 lg:mb-0"
            :disabled="!auctionTransaction.isActive"
            :is-loading="isConnecting"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="$emit('connect')"
            @disconnectWallet="$emit('disconnect')"
        />
        <AccessDaiBlock
            class="mb-6 lg:mb-0"
            :disabled="!auctionTransaction.isActive || !isConnected"
            :is-loading="isGrantingAccess"
            :is-dai-access-granted="isDaiAccessGranted"
            :is-explanations-shown="isExplanationsShown"
            @grantAccess="$emit('grantDaiAccess')"
        />
        <DepositBlock
            class="mb-6 lg:mb-0"
            :disabled="!auctionTransaction.isActive || !isDaiAccessGranted"
            :transaction-amount-dai="transactionAmountDai"
            :is-loading="isDepositing"
            :wallet-dai="walletDai"
            :wallet-vat-dai="walletVatDai"
            @deposit="$emit('deposit', $event)"
        />
        <AuthorisationBlock
            class="mb-6 lg:mb-0"
            :disabled="!isEnoughDeposited || !auctionTransaction.isActive || !isDaiAccessGranted"
            :auction-transaction="auctionTransaction"
            :is-loading="isAuthorizing"
            :is-wallet-authorised="isWalletAuthorised"
            :is-collateral-authorised="isCollateralAuthorised"
            :is-explanations-shown="isExplanationsShown"
            @authorizeWallet="$emit('authorizeWallet')"
            @authorizeCollateral="$emit('authorizeCollateral', auctionTransaction.collateralType)"
        />
        <BidBlock
            :auction-transaction="auctionTransaction"
            :transaction-amount-dai="transactionAmountDai"
            :disabled="!auctionTransaction.isActive || !isWalletAuthorised || !isCollateralAuthorised"
            :is-loading="isExecuting"
            :is-explanations-shown="isExplanationsShown"
            @execute="$emit('execute')"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import AuthorisationBlock from './AuthorisationBlock.vue';
import BidTransactionTable from './BidTransactionTable.vue';
import WalletBlock from './WalletBlock.vue';
import AccessDaiBlock from './AccessDaiBlock.vue';
import DepositBlock from './DepositBlock.vue';
import BidBlock from './BidBlock.vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BidTransactionTable,
        AuthorisationBlock,
        WalletBlock,
        AccessDaiBlock,
        DepositBlock,
        BidBlock,
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
        isGrantingAccess: {
            type: Boolean,
            default: false,
        },
        isDepositing: {
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
        isDaiAccessGranted: {
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
        transactionAmountDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        minimumDepositDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        minimumBidDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
    },
    computed: {
        isConnected(): boolean {
            return this.walletAddress !== null;
        },
        isCollateralAuthorised(): boolean {
            return this.authorisedCollaterals.includes(this.auctionTransaction.collateralType);
        },
        isEnoughDeposited(): boolean {
            return this.walletVatDai.isGreaterThanOrEqualTo(this.transactionAmountDai);
        },
    },
});
</script>
