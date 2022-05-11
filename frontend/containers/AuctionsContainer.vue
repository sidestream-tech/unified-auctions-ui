<template>
    <div>
        <MainFlow
            :auctions="auctions"
            :are-auctions-fetching="areAuctionsFetching"
            :is-selected-auction-fetching="isSelectedAuctionFetching"
            :are-take-events-fetching="areTakeEventsFetching"
            :auctions-error="auctionsError"
            :selected-auction-id.sync="selectedAuctionId"
            :is-explanations-shown.sync="isExplanationsShown"
            :wallet-address="walletAddress"
            :is-wallet-loading="isWalletLoading"
            :is-depositing-or-withdrawing="isDepositingOrWithdrawing"
            :is-authorizing="isAuthorizing"
            :is-wallet-authorized="isWalletAuthorized"
            :authorised-collaterals="authorisedCollaterals"
            :is-executing="isAuctionBidding"
            :take-event-storage="takeEvents"
            :wallet-dai="walletDai"
            :wallet-vat-dai="walletVatDai"
            :collateral-vat-balance-store="collateralVatBalanceStore"
            :is-fetching-collateral-vat-balance="isFetchingCollateralVatBalance"
            :last-updated="lastUpdated"
            @fetchCollateralVatBalance="fetchCollateralVatBalance"
            @withdrawAllCollateralFromVat="withdrawAllCollateralFromVat"
            @manageVat="openWalletModal"
            @connect="openSelectWalletModal"
            @disconnect="disconnect"
            @authorizeWallet="authorizeWallet"
            @authorizeCollateral="authorizeCollateral"
            @restart="restartAuction"
            @execute="bidWithCallee"
            @bidWithDai="bidWithDai"
            @fetchTakeEventsFromAuction="fetchTakeEventsByAuctionId"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import MainFlow from '~/components/MainFlow.vue';

export default Vue.extend({
    components: {
        MainFlow,
    },
    computed: {
        ...mapGetters('auctions', {
            auctions: 'listAuctionTransactions',
            takeEvents: 'getTakeEventStorage',
            areAuctionsFetching: 'getAreAuctionsFetching',
            isSelectedAuctionFetching: 'getIsSelectedAuctionFetching',
            areTakeEventsFetching: 'getAreTakeEventsFetching',
            isAuctionBidding: 'getIsBidding',
            auctionsError: 'getError',
            lastUpdated: 'getLastUpdated',
        }),
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
            isDepositingOrWithdrawing: 'isDepositingOrWithdrawing',
            isFetchingCollateralVatBalance: 'isFetchingCollateralVatBalance',
            collateralVatBalanceStore: 'collateralVatBalanceStore',
        }),
        ...mapGetters('authorizations', {
            isAuthorizing: 'isAuthorizationLoading',
            isWalletAuthorized: 'isWalletAuthorizationDone',
            authorisedCollaterals: 'collateralAuthorizations',
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
                    this.updateSingleAuction(newAuctionId);
                }
            },
        },
        isExplanationsShown: {
            get(): boolean {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown): void {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        selectedAuction(): Auction | undefined {
            return this.auctions.find((auction: Auction) => auction.id === this.selectedAuctionId);
        },
        fetchedSelectedAuctionId(): string | undefined {
            return this.selectedAuction && this.selectedAuction.id;
        },
        hasAcceptedTerms(): boolean {
            return this.$store.getters['cookies/hasAcceptedTerms'];
        },
        walletDai(): BigNumber {
            return this.walletBalances?.walletDAI;
        },
        walletVatDai(): BigNumber {
            return this.walletBalances?.walletVatDAI;
        },
    },
    watch: {
        fetchedSelectedAuctionId: {
            immediate: true,
            handler(): void {
                this.fetchRelatedData();
            },
        },
        walletAddress(): void {
            this.fetchRelatedData();
        },
    },
    methods: {
        ...mapActions('authorizations', [
            'authorizeWallet',
            'authorizeCollateral',
            'fetchWalletAuthorizationStatus',
            'fetchCollateralAuthorizationStatus',
        ]),
        ...mapActions('auctions', [
            'bidWithCallee',
            'bidWithDai',
            'restart',
            'fetchTakeEventsByAuctionId',
            'update',
            'updateSingleAuction',
        ]),
        ...mapActions('wallet', ['fetchWalletBalances', 'fetchCollateralVatBalance', 'withdrawAllCollateralFromVat']),
        openSelectWalletModal(): void {
            if (!this.hasAcceptedTerms) {
                this.$store.commit('modals/setTermsModal', true);
                return;
            }
            this.$store.commit('modals/setSelectWalletModal', true);
        },
        openWalletModal(): void {
            this.$store.commit('modals/setWalletModal', true);
        },
        disconnect(): void {
            this.$store.dispatch('wallet/disconnect');
        },
        restartAuction(auctionId: string): void {
            this.restart(auctionId);
        },
        fetchRelatedData(): void {
            if (!this.fetchedSelectedAuctionId || !this.walletAddress) {
                return;
            }
            this.fetchWalletBalances();
            this.fetchWalletAuthorizationStatus();
            this.fetchCollateralAuthorizationStatus(this.selectedAuction.collateralType);
            this.fetchCollateralVatBalance(this.selectedAuction.collateralType);
        },
    },
});
</script>
