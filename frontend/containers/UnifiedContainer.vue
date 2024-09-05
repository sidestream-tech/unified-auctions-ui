<template>
    <div>
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
    },
});
</script>
