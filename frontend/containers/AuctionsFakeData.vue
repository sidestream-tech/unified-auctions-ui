<template>
    <MainFlow
        :auctions="auctions"
        :selected-auction-id.sync="selectedAuctionId"
        :is-connecting="isConnecting"
        :is-authorizing="isAuthorizing"
        :is-authorised="isAuthorised"
        :is-executing="isExecuting"
        :wallet-address="walletAddress"
        :transaction-address="selectedAuction && selectedAuction.transactionAddress"
        :is-explanations-shown.sync="isExplanationsShown"
        @connect="connect"
        @disconnect="disconnect"
        @authorize="authorize"
        @execute="execute"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import faker from 'faker';
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
            isAuthorised: false,
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
                this.isAuthorised = false;
                if (this.selectedAuction) {
                    this.selectedAuction.transactionAddress = undefined;
                }
                this.isConnecting = false;
            }, 1000);
        },
        authorize() {
            this.isAuthorizing = true;
            setTimeout(() => {
                this.isAuthorised = true;
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
    },
});
</script>
