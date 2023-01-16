<template>
    <Modal
        :visible="true"
        :mask-closable="!!currentRpcUrl"
        :closable="!!currentRpcUrl"
        :footer="null"
        title="RPC URL Configuration"
        destroy-on-close
        @cancel="close()"
    >
        <div class="px-4 pt-2 pb-4">
            <TextBlock>
                In order for the application to make requests to the blockchain, fetch auctions and market data, and
                send transactions, it needs the address of a RPC URL. To get this URL, you can
                <a href="#" target="_blank">run your own Ethereum node</a> or use external services like
                <a href="https://www.alchemy.com/" target="_blank">Alchemy</a> or
                <a href="https://www.infura.io/" target="_blank">Infura</a>.
            </TextBlock>
            <div class="flex mt-2 gap-x-2">
                <Input v-model="newRpcUrl" :disabled="disabled" placeholder="https://" />
                <BaseButton type="primary" :disabled="disabled" @click="connect()">{{ buttonText }}</BaseButton>
            </div>
        </div>
    </Modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal, Input } from 'ant-design-vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';

export default Vue.extend({
    name: 'RpcUrlConfigurationModal',
    components: { Modal, Input, TextBlock, BaseButton },
    props: {
        currentRpcUrl: {
            type: String,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            newRpcUrl: this.currentRpcUrl,
        };
    },
    computed: {
        buttonText(): string {
            if (this.disabled) {
                return this.currentRpcUrl ? 'Reconnecting...' : 'Connecting...';
            }
            return this.currentRpcUrl ? 'Reconnect' : 'Connect';
        },
    },
    methods: {
        connect() {
            this.$emit('configureRpcUrl', this.newRpcUrl);
        },
        close() {
            this.$emit('close');
        },
    },
});
</script>
