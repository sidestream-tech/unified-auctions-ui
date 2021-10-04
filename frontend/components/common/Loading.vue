<template>
    <div class="relative">
        <slot class="opacity-20" />
        <div
            v-if="isLoading || error"
            class="absolute inset-0 flex flex-wrap justify-center content-center z-10"
            :class="{
                'bg-white dark:bg-dark dark:bg-opacity-90': isLoading,
                'bg-gray-400 dark:bg-gray-800 dark:bg-opacity-90': !isLoading && error,
                'bg-opacity-90': isLoading || error,
            }"
        >
            <LoadingIcon v-if="isLoading" class="h-8 w-8 animate animate-spin fill-current dark:text-gray-300" />
            <div v-else-if="error" class="text-red-500 font-bold">{{ error }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LoadingIcon from '~/assets/icons/loading.svg';

export default Vue.extend({
    components: {
        LoadingIcon,
    },
    props: {
        isLoading: {
            type: Boolean,
            default: false,
        },
        error: {
            type: String,
            default: '',
        },
    },
});
</script>
