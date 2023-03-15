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
                In order for the application to make requests to the blockchain, fetch auctions, market data and send
                transactions, it needs the address of a RPC URL. To get this URL, you can use external services like
                <a href="https://www.alchemy.com/" target="_blank">Alchemy</a> or
                <a href="https://www.infura.io/" target="_blank">Infura</a>
                or
                <a href="https://ethereum.org/en/run-a-node/" target="_blank">run your own Ethereum node</a>.
            </TextBlock>
            <form class="flex mt-2 gap-x-2" @submit.prevent="connect">
                <Input v-model="newRpcUrl" :disabled="isChangingNetwork" autofocus placeholder="https://" />
                <BaseButton type="primary" html-type="submit" :disabled="isButtonDisabled">{{
                    buttonText
                }}</BaseButton>
            </form>
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
        isShown: {
            type: Boolean,
            default: false,
        },
        currentRpcUrl: {
            type: String,
            default: undefined,
        },
        isChangingNetwork: {
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
            if (this.isChangingNetwork) {
                return this.currentRpcUrl ? 'Reconnecting...' : 'Connecting...';
            }
            return this.currentRpcUrl ? 'Reconnect' : 'Connect';
        },
        isButtonDisabled(): boolean {
            return this.isChangingNetwork || this.currentRpcUrl === this.newRpcUrl;
        },
    },
    methods: {
        connect() {
            this.$emit('configureRpcUrl', this.newRpcUrl);
        },
        close() {
            this.$emit('update:isShown', false);
        },
    },
});
</script>
