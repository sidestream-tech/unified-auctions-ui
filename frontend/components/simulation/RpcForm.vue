<template>
    <form class="flex gap-4" @submit.prevent="submitForm">
        <Input v-model="inputUrl" placeholder="https://" :disabled="isLoading || disabled" />
        <div class="w-48">
            <BaseButton
                v-if="!isConnected"
                class="w-full"
                :type="inputUrl ? 'primary' : ''"
                :is-loading="isLoading"
                :disabled="disabled"
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
import { Input, message } from 'ant-design-vue';
import BaseButton from '~/components/common/BaseButton.vue';

export default Vue.extend({
    components: {
        BaseButton,
        Input,
    },
    props: {
        url: {
            type: String,
            default: null,
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
            if (!this.inputUrl.startsWith('https://')) {
                message.error('RPC url should start with https://');
                return;
            }
            this.$emit('submit', this.inputUrl);
        },
    },
});
</script>
