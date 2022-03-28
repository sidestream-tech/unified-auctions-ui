<template>
    <Modal
        :visible="isShown"
        class="WalletModal"
        title="Connect a Wallet"
        :footer="null"
        :dialog-style="{ top: '60px' }"
        destroy-on-close
        @cancel="close"
    >
        <ul>
            <li
                v-for="wallet in wallets"
                :key="wallet.value"
                class="w-full hover:bg-primary px-4 py-2 cursor-pointer flex items-center"
                @click="submit(wallet.value)"
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
    name: 'WalletSelectModal',
    components: {
        Modal,
    },
    props: {
        isShown: {
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
        submit(wallet: string) {
            this.$emit('connect', wallet);
            this.$emit('close');
        },
        close() {
            this.$emit('close');
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
