<template>
    <Select
        v-if="walletAddress || isLoading"
        :options="menuOptions"
        :title="walletAddress"
        class="text-white"
        @input="determineMenuAction"
    >
        <template #text-prefix>
            <icon type="wallet" class="pr-2 text-3xl md:text-sm" />
        </template>
        <template #title>
            <div v-if="isLoading" class="flex items-center">
                <span>Connecting...</span>
            </div>
            <FormatAddress v-else-if="walletAddress" :value="walletAddress" shorten disable />
        </template>
    </Select>
    <div v-else-if="!hasAcceptedTerms" class="flex items-center cursor-pointer" @click="$emit('openTermsModal')">
        <icon type="wallet" class="pr-2 text-white text-3xl md:text-sm" />
        <span class="hidden lg:inline text-white">Connect a Wallet</span>
    </div>
    <Select
        v-else
        title="Connect a Wallet"
        :options="wallets"
        :visible="isModalOpen"
        class="text-white"
        @update:visible="$emit('update:isModalOpen', $event)"
        @input="$emit('changeWalletType', $event)"
    >
        <template #text-prefix>
            <icon type="wallet" class="pr-2 text-3xl md:text-sm" />
        </template>
    </Select>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';
import { WALLETS } from '~/lib/wallet';
import Select from '~/components/common/inputs/Select.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

export default Vue.extend({
    components: {
        Select,
        Icon,
        FormatAddress,
    },
    props: {
        walletAddress: {
            type: String,
            default: null,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isModalOpen: {
            type: Boolean,
            default: false,
        },
        hasAcceptedTerms: {
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
        menuOptions(): SelectOption[] {
            return [
                { label: 'Manage Wallet', value: 'openWalletModal' },
                { label: 'Manage Collaterals', value: 'openManageCollateralModal' },
                { label: 'Disconnect', value: 'changeWalletType' },
            ];
        },
    },
    methods: {
        determineMenuAction(eventName) {
            this.$emit(eventName);
        },
    },
});
</script>
