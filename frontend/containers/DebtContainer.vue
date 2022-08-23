<template>
    <DebtFlow
        :auctions="auctions"
        :selected-auction-id.sync="selectedAuctionId"
        :auctions-error="auctionsError"
        :auction-errors="auctionErrors"
        :auction-action-state="auctionActionStates"
        :are-auctions-fetching="areAuctionsFetching"
        :wallet-address="walletAddress"
        :wallet-balances="walletBalances"
        :allowance-dai="allowanceDai"
        :is-connecting-wallet="isConnectingWallet"
        :is-refreshing-wallet="isRefreshingWallet"
        :is-authorizing="isAuthorizing"
        :is-debt-auction-authorized="isDebtAuctionAuthorizationDone"
        :is-setting-allowance="isAuthorizationLoading"
        :last-updated="lastUpdated"
        :is-explanations-shown.sync="isExplanationsShown"
        :network="network"
        :token-address="tokenAddress"
        :is-withdrawing="isWithdrawing"
        :dai-vat-balance="daiVatBalance"
        @connectWallet="openSelectWalletModal"
        @disconnectWallet="disconnectWallet"
        @refreshWallet="refreshWallet"
        @withdrawAllDaiFromVat="withdrawAllDaiFromVat"
        @restart="restartAuction"
        @setAllowanceAmount="setAllowanceAmountDai"
        @collect="collect"
        @deposit="deposit"
        @authorizeFlopper="authorizeDebtAuctionContract"
        @bid="bid"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import DebtFlow from '~/components/auction/debt/DebtFlow.vue';

export default Vue.extend({
    components: {
        DebtFlow,
    },
    props: {
        network: {
            type: String,
            default: null,
        },
    },
    computed: {
        ...mapGetters('debt', {
            auctions: 'auctions',
            areAuctionsFetching: 'areAuctionsFetching',
            auctionErrors: 'getAuctionErrors',
            auctionActionStates: 'auctionStates',
            auctionsError: 'error',
            lastUpdated: 'lastUpdated',
            tokenAddress: 'getTokenAddress',
            isAuthorizationLoading: 'isAuthorizationLoading',
        }),
        ...mapGetters('wallet', {
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
            isConnectingWallet: 'isLoading',
            isRefreshingWallet: 'isFetchingBalances',
            isWithdrawing: 'isDepositingOrWithdrawing',
        }),
        ...mapGetters('authorizations', {
            isAuthorizing: 'isDebtAuctionAuthorizationLoading',
            isDebtAuctionAuthorizationDone: 'isDebtAuctionAuthorizationDone',
            allowanceDai: 'allowanceAmount',
        }),
        daiVatBalance(): BigNumber | undefined {
            return this.walletBalances?.walletVatDAI;
        },
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
    },
    methods: {
        ...mapActions('debt', {
            updateAllAuctions: 'fetchDebtAuctions',
            restartAuction: 'restartAuction',
            collect: 'collectAuction',
            bid: 'bidToDebtAuction',
        }),
        ...mapActions('authorizations', {
            setAllowanceAmountDai: 'setAllowanceAmount',
            authorizeDebtAuctionContract: 'authorizeDebtAuctionContract',
        }),
        ...mapActions('wallet', {
            refreshWallet: 'fetchWalletBalances',
            disconnectWallet: 'disconnect',
            deposit: 'depositToVAT',
        }),
        withdrawAllDaiFromVat() {
            this.$store.dispatch('wallet/withdrawFromVAT', this.daiVatBalance);
        },
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
