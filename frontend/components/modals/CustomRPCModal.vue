<template>
    <modal :visible="true" :mask-closable="false" :closable="false" :footer="null" title="Set Custom RPC endpoint">
        <div class="flex flex-col p-5 gap-5">
            <ChaoslabsContainer :access-token="accessToken" :simulation-ids="simulationIds" @url="rpcUrl = $event" />
            <form class="flex flex-col sm:flex-row justify-end gap-5" @submit.prevent="submitForm">
                <Input v-model="rpcUrl" placeholder="https://" />
                <BaseButton type="primary" :disabled="!rpcUrl" html-type="submit">Set RPC endpoint</BaseButton>
            </form>
        </div>
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal, Input, message } from 'ant-design-vue';
import BaseButton from '~/components/common/BaseButton';
import ChaoslabsContainer from '~/containers/ChaoslabsContainer.vue';

export default Vue.extend({
    components: { Modal, BaseButton, Input, ChaoslabsContainer },
    props: {
        accessToken: {
            type: String,
            default: '',
        },
        simulationIds: {
            type: String,
            default: '',
        },
    },
    data: () => ({ rpcUrl: '' }),
    methods: {
        submitForm() {
            if (!this.rpcUrl.startsWith('https://')) {
                message.error('RPC url should start with https://');
                return;
            }
            this.$emit('url', this.rpcUrl);
        },
    },
});
</script>
