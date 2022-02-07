<template>
    <div class="DashboardContainer">
        <DashboardAuctionsView
            :collaterals="collaterals"
            :callees="callees"
            :is-explanations-shown.sync="isExplanationsShown"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { getCalleesByNetworkType } from 'auctions-core/src/constants/CALLEES';
import DashboardAuctionsView from '~/components/DashboardAuctionsView.vue';

export default Vue.extend({
    components: {
        DashboardAuctionsView,
    },
    computed: {
        ...mapGetters('collaterals', {
            collaterals: 'collaterals',
        }),
        isExplanationsShown: {
            get(): boolean {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown): void {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        callees(): CalleeAddresses {
            const pageNetwork = this.$store?.getters['network/getPageNetwork'];
            return getCalleesByNetworkType(pageNetwork);
        },
    },
    async mounted() {
        await this.$store.dispatch('collaterals/setup');
    },
});
</script>

<style scoped>
.DashboardContainer {
    min-height: calc(100vh - 9.8rem);
}
</style>
