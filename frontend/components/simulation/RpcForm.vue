<template>
    <form class="flex flex-col md:flex-row gap-4 items-end" @submit.prevent="submitForm">
        <label class="w-full">
            <TextBlock class="font-semibold text-xs">Or directly provice RPC url</TextBlock>
            <Input v-model="inputUrl" placeholder="https://" :disabled="isLoading || disabled || isConnected" />
        </label>
        <div class="w-48">
            <BaseButton
                v-if="!isConnected"
                class="w-full"
                :type="inputUrl ? 'primary' : ''"
                :is-loading="isLoading"
                :disabled="disabled || !inputUrl"
                html-type="submit"
            >
                <span>Connect{{ isLoading ? 'ing...' : '' }}</span>
            </BaseButton>
            <BaseButton v-else class="w-full" :is-loading="isLoading" :disabled="disabled" html-type="submit">
                Disconnect
            </BaseButton>
        </div>
    </form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Input } from 'ant-design-vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    components: {
        BaseButton,
        Input,
        TextBlock,
    },
    props: {
        url: {
            type: String,
            default: '',
        },
        isConnected: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            inputUrl: this.url || '',
        };
    },
    methods: {
        submitForm() {
            this.$emit('submit', this.inputUrl.trim());
        },
    },
});
</script>
