<template>
    <div>
        <Header
            class="sticky top-0 z-50 w-full h-16"
            :is-explanations-shown.sync="isExplanationsShown"
            :network.sync="network"
        />
        <Nuxt />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Header from '~/components/layout/Header.vue';

export default Vue.extend({
    components: {
        Header,
    },
    computed: {
        isExplanationsShown: {
            get() {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown) {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        network: {
            get() {
                return this.$store.getters['preferences/getNetwork'];
            },
            set(newNetwork) {
                this.$store.dispatch('preferences/setNetwork', newNetwork);
            },
        },
    },
});
</script>
