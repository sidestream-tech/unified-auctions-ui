<template>
    <div :class="isDarkMode && 'dark bg-gray-900'">
        <Header
            class="sticky top-0 z-50 w-full h-16"
            type="features"
            :is-explanations-shown.sync="isExplanationsShown"
            :dark-mode.sync="isDarkMode"
            :staging-banner-url="stagingBannerURL"
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
        isDarkMode: {
            get(): Boolean {
                return this.$store.getters['preferences/getIsDarkMode'];
            },
            set(newIsDarkMode) {
                this.$store.dispatch('preferences/setIsDarkMode', newIsDarkMode);
            },
        },
        stagingBannerURL() {
            return process.env.STAGING_BANNER_URL;
        },
    },
});
</script>
