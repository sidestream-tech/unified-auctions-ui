<template>
    <div>
        <SurplusFlow
            :auctions="auctions"
            :selected-auction-id.sync="selectedAuctionId"
            :auctions-error="auctionsError"
            :auction-errors="auctionErrors"
            :auction-action-state="auctionActionStates"
            :are-auctions-fetching="areAuctionsFetching"
            :wallet-address="walletAddress"
            :wallet-balances="walletBalances"
            :allowance-m-k-r="allowanceMKR"
            :is-connecting-wallet="isConnectingWallet"
            :is-refreshing-wallet="isRefreshingWallet"
            :is-setting-allowance="false"
            :last-updated="lastUpdated"
            :is-explanations-shown.sync="isExplanationsShown"
            :network="network"
            :token-address="tokenAddress"
            @connectWallet="openSelectWalletModal"
            @disconnectWallet="disconnectWallet"
            @refreshWallet="refreshWallet"
            @restart="restartAuction"
            @setAllowanceAmount="setAllowanceAmountMKR"
            @collect="collect"
            @bid="bid"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import SurplusFlow from '~/components/surplus/SurplusFlow.vue';

export default Vue.extend({
    components: {
        SurplusFlow,
    },
    props: {
        network: {
            type: String,
            default: null,
        },
    },
    computed: {
        ...mapGetters('surplus', {
            auctions: 'auctionStorage',
            areAuctionsFetching: 'areAuctionsFetching',
            auctionErrors: 'getAuctionErrors',
            auctionActionStates: 'auctionStates',
            allowanceMKR: 'allowanceAmount',
            auctionsError: 'error',
            lastUpdated: 'lastUpdated',
        }),
        ...mapGetters('wallet', {
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
            isConnectingWallet: 'isLoading',
            isRefreshingWallet: 'isFetchingBalances',
        }),
        selectedAuctionId: {
            get(): string | null {
                const auctionGetParameter = this.$route.query.auction;
                if (Array.isArray(auctionGetParameter)) {
                    return auctionGetParameter[0];
                } else {
                    return auctionGetParameter;
                }
            },
            set(newAuctionId: string): void {
                if (!newAuctionId) {
                    const network = this.$route.query.network;
                    this.$router.push({ query: { network } });
                    this.updateAllAuctions();
                }
            },
        },
        hasAcceptedTerms(): boolean {
            return this.$store.getters['cookies/hasAcceptedTerms'];
        },
        isExplanationsShown: {
            get(): boolean {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown): void {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        tokenAddress(): string {
            return this.$store.dispatch('surplus/getMKRTokenAddress');
        },
    },
    methods: {
        ...mapActions('surplus', {
            updateAllAuctions: 'fetchSurplusAuctions',
            restartAuction: 'restartAuction',
            setAllowanceAmountMKR: 'setAllowanceAmountMKR',
            collect: 'collectAuction',
            bid: 'bidToSurplusAuction',
        }),
        ...mapActions('wallet', {
            refreshWallet: 'fetchWalletBalances',
            disconnectWallet: 'disconnect',
        }),
        openSelectWalletModal(): void {
            if (!this.hasAcceptedTerms) {
                this.$store.commit('modals/setTermsModal', true);
                return;
            }
            this.$store.commit('modals/setSelectWalletModal', true);
        },
    },
});
</script>
