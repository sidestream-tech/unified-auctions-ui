<template>
    <div :class="doShowHeader ? 'UnifiedHeaderPrependedContainer' : 'UnifiedContainer'">
        <UnifiedAuctionsView :is-explanations-shown.sync="isExplanationsShown" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import UnifiedAuctionsView from '~/components/unified/UnifiedAuctionsView.vue';

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
        doShowHeader(): boolean {
            return !!process.env.STAGING_BANNER_URL;
        },
    },
});
</script>

<style scoped>
.UnifiedContainer {
    min-height: calc(100vh - 9.8rem);
}

.UnifiedHeaderPrependedContainer {
    margin-top: 2.3rem;
    min-height: calc(100vh - 12.1rem);
}
</style>
