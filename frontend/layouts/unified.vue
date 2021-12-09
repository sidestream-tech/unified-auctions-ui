<template>
    <div>
        <Header
            class="sticky top-0 z-50 w-full h-16"
            type="unified"
            :is-explanations-shown.sync="isExplanationsShown"
        />
        <Nuxt />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Header from '~/components/layout/Header.vue';
import '~/assets/styles/index';

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
    },
});
</script>
