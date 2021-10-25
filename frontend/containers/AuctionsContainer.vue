<template>
    <div>
        <MainFlow
            :auctions="auctions"
            :is-auctions-loading="isAuctionsLoading"
            :auctions-error="auctionsError"
            :selected-auction-id.sync="selectedAuctionId"
            :is-explanations-shown.sync="isExplanationsShown"
            :wallet-address="walletAddress"
            :is-wallet-loading="isWalletLoading"
            :is-authorizing="isAuthorizing"
            :is-wallet-authorised="isWalletAuthorised"
            :authorised-collaterals="authorisedCollaterals"
            @connect="openWalletModal"
            @disconnect="disconnect"
            @authorizeWallet="authorizeWallet"
            @authorizeCollateral="authorizeCollateral"
            @restart="restart"
            @execute="execute"
        />
        <WalletModal :visible.sync="isModalOpen" @connect="connect" />
    </div>
</template>

<script lang="ts">
import { message } from 'ant-design-vue';
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import MainFlow from '~/components/MainFlow.vue';
import WalletModal from '~/components/utils/WalletModal.vue';

export default Vue.extend({
    components: {
        MainFlow,
        WalletModal,
    },
    data() {
        return { isModalOpen: false };
    },
    computed: {
        ...mapGetters('auctions', {
            auctions: 'list',
            isAuctionsLoading: 'getIsLoading',
            auctionsError: 'getError',
        }),
        ...mapGetters('wallet', {
            isWalletLoading: 'isLoading',
            walletAddress: 'getAddress',
        }),
        ...mapGetters('authorizations', {
            isAuthorizing: 'isAuthorizationLoading',
            isWalletAuthorised: 'isWalletAuthorizationDone',
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
                if (!newAuctionId && this.$router.currentRoute.fullPath !== '/') {
                    this.$router.replace('/');
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
        selectedAuction(): Auction | null {
            return this.auctions.find((auction: Auction) => auction.id === this.selectedAuctionId) || null;
        },
    },
    watch: {
        selectedAuction: {
            immediate: true,
            handler(selectedAuction) {
                if (!selectedAuction) {
                    return;
                }
                this.fetchWalletAuthorizationStatus();
                this.fetchCollateralAuthorizationStatus(selectedAuction.collateralType);
            },
        },
    },
    created(): void {
        this.$store.dispatch('auctions/fetch');
        this.$store.dispatch('wallet/autoConnect');
    },
    methods: {
        ...mapActions('authorizations', [
            'authorizeWallet',
            'authorizeCollateral',
            'fetchWalletAuthorizationStatus',
            'fetchCollateralAuthorizationStatus',
        ]),
        openWalletModal(): void {
            this.isModalOpen = true;
        },
        connect(walletType: string): void {
            this.isModalOpen = false;
            this.$store.dispatch('wallet/changeWalletType', walletType);
        },
        disconnect(): void {
            this.$store.dispatch('wallet/disconnect');
        },
        execute(): void {
            message.error('This feature is not yet implemented');
        },
        restart(): void {
            message.error('This feature is not yet implemented');
        },
    },
});
</script>
