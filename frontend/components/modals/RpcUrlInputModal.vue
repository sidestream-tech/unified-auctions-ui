<template>
    <Modal
        :visible="true"
        :mask-closable="false"
        :closable="false"
        :footer="null"
        title="RPC URL"
        destroy-on-close
        class="flex items-center justify-center"
    >
        <div class="flex flex-col p-4 gap-y-2">
            <span>Please provide a valid RPC URL:</span>
            <Input v-model="rpcUrl" placeholder="RPC URL" class="flex flex-grow" />
            <BaseButton type="primary" class="place-self-center" @click="$emit('setRpcUrl', rpcUrl)">
                Submit
            </BaseButton>
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
    data() {
        return {
            rpcUrl: '',
        };
    },
});
</script>
