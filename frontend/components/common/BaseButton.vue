<template>
    <Button
        :disabled="disabled || isLoading"
        :class="{
            'text-white bg-primary border-primary active:bg-primary-dark active:border-primary-dark  focus:bg-primary-light focus:border-primary-light hover:bg-primary-light hover:border-primary-light':
                type == 'primary',
        }"
        :type="type"
        @click="$emit('click')"
    >
        <div v-if="isLoading" class="flex items-center space-x-2">
            <loading-icon class="h-3 w-3 fill-current text-gray-400 animate-spin mr-2" />
            <slot />
        </div>
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
    },
});
</script>
