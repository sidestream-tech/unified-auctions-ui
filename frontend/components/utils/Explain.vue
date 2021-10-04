<template>
    <Popover
        v-model="isVisible"
        trigger="click"
        :title="title || text"
        :overlay-style="{ width: '200px' }"
        :get-popup-container="getPopupContainer"
        overlay-class-name="ExplainOverlay"
    >
        <span class="Explain" :class="{ Pressed: isVisible }">{{ text }}</span>
        <template #content>
            <slot>{{ content }}</slot>
        </template>
    </Popover>
</template>

<script lang="ts">
import Vue from 'vue';
import { Popover } from 'ant-design-vue';

export default Vue.extend({
    components: {
        Popover,
    },
    props: {
        text: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: '',
        },
        content: {
            type: String,
            default: '',
        },
        getPopupContainer: {
            type: Function,
            default: () => document.body,
        },
    },
    data() {
        return { isVisible: false };
    },
});
</script>

<style scoped>
.Explain {
    padding: 0 0.2em 0.1em;
    @apply border rounded cursor-pointer border-gray-300 bg-gray-100;
    @apply dark:border-gray-600 dark:bg-gray-800;
}
.Explain.Pressed {
    @apply border-yellow-400;
}
</style>

<style>
.ExplainOverlay a {
    @apply text-primary underline;
}
</style>
