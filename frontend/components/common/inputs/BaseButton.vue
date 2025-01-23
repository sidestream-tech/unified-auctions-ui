<template>
    <Button
        :disabled="disabled || isLoading"
        :class="buttonClass"
        class="Button"
        :type="type"
        :html-type="htmlType"
        @click="$emit('click')"
    >
        <template v-if="isLoading">
            <span><loading-icon class="h-3 w-3 fill-current text-gray-400 animate-spin mr-2 my-auto" /></span>
            <slot />
        </template>
        <slot v-else />
    </Button>
</template>
<script lang="ts">
import Vue from 'vue';
import { Button } from 'ant-design-vue';
import LoadingIcon from '~/assets/icons/loading.svg';

export default Vue.extend({
    components: {
        Button,
        LoadingIcon,
    },
    props: {
        type: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        htmlType: {
            type: String,
            default: 'button',
        },
    },
    computed: {
        buttonClass() {
            if (this.type === 'primary') {
                return 'Primary';
            }
            if (this.type === 'link') {
                return 'Link';
            }
            return 'Default';
        },
    },
});
</script>

<style scoped>
.Button {
    @apply w-auto;
}

.Button.Default:enabled {
    @apply border-primary text-primary hover:text-white hover:bg-primary-light hover:border-primary-light;
}

.Primary:enabled,
.dark .Primary:enabled {
    @apply text-white bg-primary border-primary focus:bg-primary-light focus:border-primary-light hover:bg-primary-light hover:border-primary-light;
}

.Link,
.dark .Link {
    @apply inline-flex items-center p-0 h-auto leading-4;
}

.Link >>> span {
    @apply text-primary underline overflow-auto transition-colors;
}

.Link:hover >>> span {
    @apply text-primary-light no-underline;
}
</style>
