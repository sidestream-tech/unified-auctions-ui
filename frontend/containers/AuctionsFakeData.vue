<template>
    <MainFlow
        :auctions="auctions"
        :selected-auction-id.sync="selectedAuctionId"
        :is-connecting="isConnecting"
        :is-authorizing="isAuthorizing"
        :is-wallet-authorised="isWalletAuthorised"
        :authorised-collaterals="authorisedCollaterals"
        :is-executing="isExecuting"
        :wallet-address="walletAddress"
        :transaction-address="selectedAuction && selectedAuction.transactionAddress"
        :is-explanations-shown.sync="isExplanationsShown"
        @connect="connect"
        @disconnect="disconnect"
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
            isAuthorizing: false,
            isExecuting: false,
            isWalletAuthorised: false,
            authorisedCollaterals: [] as string[],
            walletAddress: null as string | null,
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
                if (!newAuctionId && this.$router.currentRoute.fullPath !== '/') {
                    this.$router.replace('/');
                }
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
                    this.selectedAuction.transactionAddress = faker.finance.ethereumAddress();
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
    },
});
</script>
