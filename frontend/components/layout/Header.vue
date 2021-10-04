<template>
    <header class="bg-primary">
        <nav class="flex items-center py-2 px-4 md:px-10">
            <nuxt-link to="/" class="flex items-center text-gray-700 hover:text-gray-600 no-underline">
                <branding-icon class="h-12 w-12" />
                <span class="ml-2 mb-0 hidden md:block"> Maker liquidations </span>
            </nuxt-link>

            <div class="flex-1 flex justify-end space-x-4 items-center">
                <label class="flex items-center space-x-2 cursor-pointer select-none pt-1 md:pt-0">
                    <BaseSwitch
                        :is-checked="isExplanationsShown"
                        class="mt-px"
                        @update:isChecked="$emit('update:isExplanationsShown', $event)"
                    />
                    <span class="text-gray-700">Explanations</span>
                </label>

                <NetworkSelector :network="network" @update:network="$emit('update:network', $event)" />

                <WalletSelector
                    :wallet-address="walletAddress"
                    :is-loading="isWalletLoading"
                    :is-modal-open="isWalletModalOpen"
                    @update:isModalOpen="$emit('update:isModalOpen', $event)"
                    @changeWalletType="$emit('changeWalletType', $event)"
                />
            </div>
        </nav>
    </header>
</template>

<script lang="ts">
import Vue from 'vue';
import BrandingIcon from '~/assets/icons/logo.svg';
import BaseSwitch from '~/components/common/BaseSwitch.vue';
import NetworkSelector from '~/components/utils/NetworkSelector.vue';
import WalletSelector from '~/components/utils/WalletSelector.vue';

export default Vue.extend({
    name: 'Header',
    components: {
        BrandingIcon,
        BaseSwitch,
        NetworkSelector,
        WalletSelector,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            required: true,
        },
        network: {
            type: String,
            default: null,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isWalletLoading: {
            type: Boolean,
            default: false,
        },
        isWalletModalOpen: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
