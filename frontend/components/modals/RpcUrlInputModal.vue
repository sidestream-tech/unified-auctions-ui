<template>
    <Modal
        :visible="true"
        :mask-closable="!!currentRpcUrl"
        :closable="!!currentRpcUrl"
        :footer="null"
        title="RPC URL"
        destroy-on-close
        class="flex items-center justify-center"
        @cancel="close()"
    >
        <div class="flex flex-col p-4 gap-y-2">
            <span v-if="!!currentRpcUrl">Current RPC URL: {{ currentRpcUrl }}</span>
            <span>Please provide a valid RPC URL:</span>
            <Input v-model="newRpcUrl" placeholder="RPC URL" class="flex flex-grow" />
            <BaseButton type="primary" class="place-self-center" @click="submit()"> Submit </BaseButton>
        </div>
    </Modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal, Input } from 'ant-design-vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';

export default Vue.extend({
    name: 'RpcUrlInputModal',
    components: { Modal, Input, BaseButton },
    props: {
        isShown: {
            type: Boolean,
            default: false,
        },
        currentRpcUrl: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            newRpcUrl: '',
        };
    },
    methods: {
        submit() {
            this.$emit('setRpcUrl', this.newRpcUrl);
            this.close();
        },
        close() {
            this.$emit('close');
        },
    },
});
</script>
