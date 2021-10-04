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
            @connect="openWalletModal"
            @disconnect="disconnect"
        />
        <WalletModal :visible.sync="isModalOpen" @connect="connect" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
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
    },
    created(): void {
        this.$store.dispatch('auctions/fetch');
        this.$store.dispatch('wallet/autoConnect');
    },
    methods: {
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
    },
});
</script>
