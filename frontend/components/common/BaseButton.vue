<template>
    <Button
        :disabled="disabled || isLoading"
        :class="buttonStyles"
        class="overflow-hidden"
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
        buttonStyles() {
            if (this.type === 'primary') {
                return 'Button-Primary';
            }
            if (this.type === 'link') {
                return 'Button-Link';
            }
            return '';
        },
    },
});
</script>

<style>
.Button-Primary {
    @apply text-white bg-primary border-primary focus:bg-primary-light focus:border-primary-light hover:bg-primary-light hover:border-primary-light;
}

.Button-Link {
    @apply inline-flex items-center p-1;
}

.Button-Link span {
    @apply text-primary underline overflow-auto transition-colors;
}

.Button-Link:hover span {
    @apply text-primary-light no-underline;
}
</style>
