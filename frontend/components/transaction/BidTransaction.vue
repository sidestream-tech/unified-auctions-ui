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
            @inputBidAmount="transactionAmountDai = $event"
            @amountToReceive="setAmountToReceive"
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
            :is-explanations-shown="isExplanationsShown"
            :transaction-amount-dai="transactionAmountDai"
            :is-loading="isDepositing"
            :wallet-dai="walletDai"
            :wallet-vat-dai="walletVatDai"
            @manageWallet="$emit('manageWallet')"
        />
        <AuthorisationBlock
            class="mb-6 lg:mb-0"
            :disabled="!isEnoughDeposited || !auctionTransaction.isActive || !isConnected"
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
            :amount-to-receive="amountToReceive"
            :disabled="!auctionTransaction.isActive || !isWalletAuthorised || !isCollateralAuthorised"
            :is-loading="isExecuting"
            :is-explanations-shown="isExplanationsShown"
            @execute="$emit('execute', { id: auctionTransaction.id })"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
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
            transactionAmountDai: undefined as BigNumber | undefined,
            amountToReceive: undefined as BigNumber | undefined,
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
            return this.walletVatDai.isGreaterThanOrEqualTo(this.transactionAmountDai);
        },
    },
    methods: {
        setAmountToReceive(amount: BigNumber | undefined) {
            this.amountToReceive = amount;
        },
    },
});
</script>
