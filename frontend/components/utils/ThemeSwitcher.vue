<template>
    <div class="flex items-center space-x-2 cursor-pointer pt-1 md:pt-0" @click="toggle">
        <sun-icon v-if="darkMode" class="h-8 w-8 md:h-4 md:w-4" />
        <moon-icon v-else class="h-8 w-8 md:h-4 md:w-4" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SunIcon from '~/assets/icons/sun.svg';
import MoonIcon from '~/assets/icons/moon.svg';

export default Vue.extend({
    name: 'ThemeSwitcher',
    components: {
        SunIcon,
        MoonIcon,
    },
    props: {
        darkMode: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        toggle(): void {
            if (this.darkMode) {
                document.body.classList.remove('dark');
            } else {
                document.body.classList.add('dark');
            }
            this.$emit('update', !this.darkMode);
        },
    },
});
</script>
