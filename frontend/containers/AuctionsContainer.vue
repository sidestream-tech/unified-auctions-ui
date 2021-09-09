<template>
    <MainFlow
        :auctions="auctions"
        :is-auctions-loading="isAuctionsLoading"
        :auctions-error="auctionsError"
        :selected-auction-id.sync="selectedAuctionId"
        :is-explanations-shown.sync="isExplanationsShown"
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
        isExplanationsShown: {
            get() {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown) {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
    },

    created() {
        this.$store.dispatch('auctions/fetch');
    },
});
</script>
