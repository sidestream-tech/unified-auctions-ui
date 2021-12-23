<template>
    <modal
        :visible="true"
        :mask-closable="false"
        :closable="false"
        :footer="null"
        class="my-0"
        title="Network mismatch"
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
import NETWORKS from 'auctions-core/src/constants/NETWORKS';
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
    },
    data() {
        return {
            options: [
                ...Object.entries(NETWORKS).map(([name, propeties]) => {
                    return { label: propeties.title, value: name };
                }),
            ],
        };
    },
    computed: {
        isWalletNetworkSuppotedByTheWebsite(): string {
            return !!NETWORKS[this.invalidNetwork];
        },
    },
});
</script>
