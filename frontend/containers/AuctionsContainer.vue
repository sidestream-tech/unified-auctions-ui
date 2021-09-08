<template>
    <MainFlow
        :auctions="auctions"
        :is-auctions-loading="isAuctionsLoading"
        :auctions-error="auctionsError"
        :selected-auction-id.sync="selectedAuctionId"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import MainFlow from '~/components/MainFlow.vue';

export default Vue.extend({
    components: {
        MainFlow,
    },
    computed: {
        ...mapGetters('auctions', {
            auctions: 'list',
            isAuctionsLoading: 'getIsLoading',
            auctionsError: 'getError',
        }),
        selectedAuctionId: {
            get() {
                const auctionParam = this.$route.query.auction;
                if (Array.isArray(auctionParam)) {
                    return auctionParam[0];
                } else {
                    return auctionParam;
                }
            },
            set(newAuctionId) {
                if (!newAuctionId && this.$router.currentRoute.fullPath !== '/') {
                    this.$router.replace('/');
                }
            },
        },
    },
    created() {
        this.$store.dispatch('auctions/fetch');
    },
});
</script>
