<template>
    <Popover
        v-model="isVisible"
        trigger="click"
        :title="displayTitle"
        :overlay-style="{ width: width, zIndex: '35' }"
        :get-popup-container="() => $el.parentElement"
        overlay-class-name="ExplainOverlay"
        :placement="placement"
    >
        <span class="Explain" :class="{ Pressed: isVisible }">{{ text }}</span>
        <template #content>
            <div class="capitalize-first">
                <slot>{{ content }}</slot>
            </div>
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
        showTitle: {
            type: Boolean,
            default: false,
        },
        placement: {
            type: String,
            default: 'topRight',
        },
        width: {
            type: String,
            default: '200px',
        },
    },
    data() {
        return { isVisible: false };
    },
    computed: {
        displayTitle() {
            if (!this.showTitle) {
                return null;
            }
            if (this.title) {
                return this.title;
            }
            return this.text;
        },
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
.capitalize-first::first-letter {
    @apply uppercase;
}
</style>

<style>
.ExplainOverlay a {
    @apply text-primary underline;
}
</style>
