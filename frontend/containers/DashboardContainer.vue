<template>
    <div class="DashboardContainer">
        <DashboardAuctionsView :collaterals="collaterals" :is-explanations-shown.sync="isExplanationsShown" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
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
    },
    async mounted() {
        await this.$store.dispatch('collaterals/fetchStepAndCut');
    },
});
</script>

<style scoped>
.DashboardContainer {
    min-height: calc(100vh - 9.8rem);
}
</style>
