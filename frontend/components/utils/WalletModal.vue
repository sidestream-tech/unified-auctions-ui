<template>
    <Modal
        :visible="visible"
        class="WalletModal"
        title="Connect a Wallet"
        :footer="null"
        :dialog-style="{ top: '60px' }"
        @cancel="cancel"
    >
        <ul>
            <li
                v-for="wallet in wallets"
                :key="wallet.value"
                class="w-full hover:bg-gray-200 px-4 py-2 cursor-pointer flex"
                @click="$emit('connect', wallet.value)"
            >
                <component :is="wallet.icon" v-if="wallet.icon" class="w-8 pr-3" />
                {{ wallet.label }}
            </li>
        </ul>
    </Modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal } from 'ant-design-vue';
import { WALLETS } from '~/lib/wallet';

export default Vue.extend({
    name: 'WalletModal',
    components: {
        Modal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        wallets(): SelectOption[] {
            return WALLETS.map(Wallet => {
                return { label: Wallet.title, value: Wallet.title, icon: Wallet.icon };
            });
        },
    },
    methods: {
        cancel() {
            this.$emit('update:visible', false);
        },
    },
});
</script>

<style>
.WalletModal .ant-modal-body {
    @apply px-0 py-3;
}
.WalletModal .ant-modal-header {
    @apply p-3;
}
.WalletModal .ant-modal-close {
    top: -7px;
}
</style>
