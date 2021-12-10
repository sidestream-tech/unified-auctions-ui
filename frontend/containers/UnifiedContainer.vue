<template>
    <div class="UnifiedContainer">
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
    },
});
</script>

<style scoped>
.UnifiedContainer {
    min-height: calc(100vh - 9.8rem);
}
</style>
