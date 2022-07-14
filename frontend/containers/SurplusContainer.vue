<template>
    <div>
        <SurplusFlow
            :auctions="auctions"
            :selected-auction-id.sync="selectedAuctionId"
            :auction-errors="auctionErrors"
            :auction-action-state="auctionActionStates"
            :wallet-address="walletAddress"
            :wallet-balances="walletBalances"
            :is-explanations-shown.sync="isExplanationsShown"
            :network="network"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
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
            auctionErrors: 'getAuctionErrors',
            auctionActionStates: 'auctionStates',
        }),
        ...mapGetters('wallet', {
            walletAddress: 'getAddress',
            walletBalances: 'walletBalances',
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
});
</script>
