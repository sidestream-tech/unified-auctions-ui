<template>
    <div class="w-1/2">
        <TextBlock title="Connect a wallet">
            <div v-if="walletAddress" class="text-gray-800">
                The operation will be carried over the connected wallet <format-address :value="walletAddress" />
            </div>
            <div v-else class="text-gray-800">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrudexercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button v-if="state === 'notConnected'" type="primary" @click="$emit('connectWallet')">
                Connect a wallet
            </base-button>
            <base-button v-if="state === 'connecting'" type="primary" is-loading> Connecting... </base-button>
            <base-button v-if="state === 'connected'" @click="$emit('disconnectWallet')"> Disconnect </base-button>
            <base-button v-if="state === 'disconnecting'" is-loading> Disconnecting... </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        TextBlock,
        BaseButton,
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
    },
    computed: {
        state(): string {
            if (!this.walletAddress && !this.isLoading) {
                return 'notConnected';
            }
            if (!this.walletAddress && this.isLoading) {
                return 'connecting';
            }
            if (this.walletAddress && !this.isLoading) {
                return 'connected';
            }
            return 'disconnecting';
        },
    },
});
</script>
