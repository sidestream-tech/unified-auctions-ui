<template>
    <div :class="isStagingEnvironment ? 'UnifiedStagingContainer' : 'UnifiedContainer'">
        <UnifiedAuctionsView :is-explanations-shown.sync="isExplanationsShown" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UnifiedAuctionsView from '~/components/UnifiedAuctionsView.vue';

export default Vue.extend({
    components: {
        UnifiedAuctionsView,
    },
    computed: {
        isExplanationsShown: {
            get(): boolean {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown): void {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        isStagingEnvironment() {
            return process.env.IS_STAGING_ENVIRONMENT;
        },
    },
});
</script>

<style scoped>
.UnifiedContainer {
    min-height: calc(100vh - 9.8rem);
}

.UnifiedStagingContainer {
    margin-top: 2.3rem;
    min-height: calc(100vh - 12.1rem);
}
</style>
