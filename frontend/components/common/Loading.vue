<template>
    <div class="relative">
        <slot class="opacity-20" />
        <div
            v-if="isLoading || error"
            class="absolute inset-0 flex flex-wrap justify-center content-center z-10"
            :class="{
                'bg-white': isLoading,
                'bg-gray-400': !isLoading && error,
                'bg-opacity-90': isLoading || error,
            }"
        >
            <Spin v-if="isLoading" size="large" />
            <div v-else-if="error" class="text-red-500 font-bold">{{ error }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Spin } from 'ant-design-vue';

export default Vue.extend({
    components: {
        Spin,
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
