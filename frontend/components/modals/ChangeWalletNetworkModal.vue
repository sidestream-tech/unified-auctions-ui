<template>
    <modal
        :visible="true"
        :mask-closable="false"
        :closable="false"
        :footer="null"
        class="my-0"
        title="Network mismatch"
        destroy-on-close
    >
        <Alert type="error" banner>
            <template #message>
                Connected wallet is set to "<span class="font-medium">{{ invalidNetwork }}</span
                >" network,
                <template v-if="!isWalletNetworkSuppotedByTheWebsite"> which is not supported. </template>
                <template v-else>
                    which doesn't match "<span class="font-medium">{{ pageNetwork }}</span
                    >" network of the website.
                </template>
            </template>
        </Alert>
        <div class="flex justify-end p-5 gap-5">
            <BaseButton v-if="isWalletNetworkSuppotedByTheWebsite" @click="$emit('setPageNetwork', invalidNetwork)">
                Navigate to "{{ invalidNetwork }}"
            </BaseButton>
            <BaseButton type="primary" @click="$emit('fixWalletNetwork')">
                Switch wallet to "{{ pageNetwork }}"</BaseButton
            >
        </div>
    </modal>
</template>

<script lang="ts">
import { Modal, Alert } from 'ant-design-vue';
import Vue from 'vue';
import { getNetworks } from 'auctions-core/src/network';
import BaseButton from '~/components/common/BaseButton';

export default Vue.extend({
    name: 'ChangeWalletNetworkModal',
    components: { Modal, Alert, BaseButton },
    props: {
        invalidNetwork: {
            type: String,
            required: true,
        },
        pageNetwork: {
            type: String,
            required: true,
        },
        isDev: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            options: [
                ...Object.entries(getNetworks(this.isDev)).map(([name, propeties]) => {
                    return { label: propeties.title, value: name };
                }),
            ],
        };
    },
    computed: {
        isWalletNetworkSuppotedByTheWebsite(): boolean {
            return !!getNetworks(this.isDev)[this.invalidNetwork];
        },
    },
});
</script>
