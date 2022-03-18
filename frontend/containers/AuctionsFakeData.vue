<template>
    <MainFlow
        :auctions="auctions"
        :selected-auction-id.sync="selectedAuctionId"
        :is-connecting="isConnecting"
        :is-granting-access="isGrantingAccess"
        :is-depositing-dai="isDepositingDai"
        :is-authorizing="isAuthorizing"
        :is-wallet-authorised="isWalletAuthorised"
        :is-dai-access-granted="isDaiAccessGranted"
        :authorised-collaterals="authorisedCollaterals"
        :is-executing="isExecuting"
        :wallet-address="walletAddress"
        :wallet-dai="walletDai"
        :wallet-vat-dai="walletVatDai"
        :transaction-address="selectedAuction && selectedAuction.transactionAddress"
        :transaction-amount-dai="transactionAmountDai"
        :minimum-bid-dai="minimumBidDai"
        :is-explanations-shown.sync="isExplanationsShown"
        @inputBidAmount="setTransactionAmountDai"
        @connect="connect"
        @disconnect="disconnect"
        @grantDaiAccess="grantDaiAccess"
        @deposit="deposit"
        @authorizeWallet="authorizeWallet"
        @authorizeCollateral="authorizeCollateral"
        @restart="restart"
        @execute="execute"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import faker from 'faker';
import { message } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import MainFlow from '~/components/MainFlow.vue';
import { generateFakeAuctionTransactions } from '~/helpers/generateFakeAuction';

export default Vue.extend({
    components: {
        MainFlow,
    },
    data() {
        return {
            auctions: [] as AuctionTransaction[],
            selectedAuctionId: '',
            isConnecting: false,
            isGrantingAccess: false,
            isDepositingDai: false,
            isAuthorizing: false,
            isExecuting: false,
            isWalletAuthorised: false,
            isDaiAccessGranted: false,
            isDeposited: false,
            authorisedCollaterals: [] as string[],
            walletAddress: null as string | null,
            walletDai: new BigNumber(faker.finance.amount()),
            walletVatDai: new BigNumber(faker.finance.amount()),
            minimumBidDai: new BigNumber(faker.finance.amount(0, 100)),
            transactionAmountDai: undefined as BigNumber | undefined,
        };
    },
    computed: {
        isExplanationsShown: {
            get() {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown) {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        selectedAuction(): AuctionTransaction | null {
            return this.auctions.find(auctionTransaction => auctionTransaction.id === this.selectedAuctionId) || null;
        },
    },
    watch: {
        selectedAuctionId: {
            handler(newAuctionId) {
                if (!newAuctionId) {
                    const network = this.$route.query.network;
                    this.$router.push({ query: { network } });
                }
                this.transactionAmountDai = this.selectedAuction?.totalPrice;
            },
        },
        '$route.query.auction': {
            immediate: true,
            handler(newAuctionParamId) {
                const auctionParam = newAuctionParamId;
                if (Array.isArray(auctionParam)) {
                    this.selectedAuctionId = auctionParam[0];
                } else {
                    this.selectedAuctionId = auctionParam;
                }
            },
        },
        transactionAmountDai(newAmount) {
            if (newAmount === undefined) {
                this.transactionAmountDai = this.selectedAuction?.totalPrice || undefined;
            }
        },
    },
    created() {
        this.auctions = generateFakeAuctionTransactions();
    },
    methods: {
        connect() {
            this.isConnecting = true;
            setTimeout(() => {
                this.walletAddress = faker.finance.ethereumAddress();
                this.isConnecting = false;
            }, 1000);
        },
        disconnect() {
            this.isConnecting = true;
            setTimeout(() => {
                this.walletAddress = null;
                this.isWalletAuthorised = false;
                this.authorisedCollaterals = [];
                if (this.selectedAuction) {
                    this.selectedAuction.transactionAddress = undefined;
                }
                this.isConnecting = false;
            }, 1000);
        },
        grantDaiAccess() {
            this.isGrantingAccess = true;
            setTimeout(() => {
                this.isDaiAccessGranted = true;
                this.isGrantingAccess = false;
            }, 1000);
        },
        deposit(amount: BigNumber) {
            this.isDepositingDai = true;
            setTimeout(() => {
                this.walletDai = this.walletDai.minus(amount);
                this.walletVatDai = this.walletVatDai.plus(amount);
                this.isDepositingDai = false;
            }, 1000);
        },
        authorizeWallet() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isWalletAuthorised = true;
                this.isAuthorizing = false;
            }, 1000);
        },
        authorizeCollateral(collateralType: string) {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.authorisedCollaterals.push(collateralType);
                this.isAuthorizing = false;
            }, 1000);
        },
        execute() {
            this.isExecuting = true;
            setTimeout(() => {
                if (this.selectedAuction) {
                    this.selectedAuction.isFinished = true;
                    this.selectedAuction.endDate = new Date();
                    this.selectedAuction.transactionAddress = faker.finance.ethereumAddress();
                    this.walletVatDai = this.walletVatDai.minus(this.transactionAmountDai!!);
                    this.transactionAmountDai = new BigNumber(NaN);
                }
                this.isExecuting = false;
            }, 1000);
        },
        restart() {
            if (this.selectedAuction) {
                this.selectedAuction.isActive = true;
                message.success('The auction has been restarted!');
            }
        },
        setTransactionAmountDai(amount: BigNumber | undefined) {
            this.transactionAmountDai = amount;
        },
    },
});
</script>
