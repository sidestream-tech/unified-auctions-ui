<template>
    <div>
        <SurplusFlow :is-explanations-shown.sync="isExplanationsShown" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SurplusFlow from '~/components/surplus/SurplusFlow.vue';

export default Vue.extend({
    components: {
        SurplusFlow,
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
