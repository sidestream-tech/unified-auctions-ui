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
            :minimum-deposit-dai="minimumDepositDai"
            class="mt-4 mb-6"
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
            :wallet-dai="test"
            :wallet-vat-dai="test"
            @deposit="$emit('deposit', $event)"
        />
        <AuthorisationBlock
            class="mb-6 lg:mb-0"
            :disabled="!transactionAmountDai || !auctionTransaction.isActive"
            :auction-transaction="auctionTransaction"
            :is-loading="isAuthorizing"
            :is-wallet-authorised="isWalletAuthorised"
            :is-collateral-authorised="isCollateralAuthorised"
            :is-explanations-shown="isExplanationsShown"
            @authorizeWallet="$emit('authorizeWallet')"
            @authorizeCollateral="$emit('authorizeCollateral')"
        />
        <BidBlock
            :auction-transaction="auctionTransaction"
            :transaction-amount-dai="transactionAmountDai"
            :disabled="!auctionTransaction.isActive || !isWalletAuthorised || !isCollateralAuthorised"
            :is-loading="isExecuting"
            :is-explanations-shown="isExplanationsShown"
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
        authorisedCollaterals: {
            type: Array as Vue.PropType<string[]>,
            default: () => [],
        },
        isDaiAccessGranted: {
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
        minimumDepositDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: new BigNumber(0),
        },
        transactionAmountDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
    },
    data() {
        return {
            test: new BigNumber(10),
        };
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
