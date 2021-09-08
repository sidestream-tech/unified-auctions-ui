<template>
    <div>
        <TextBlock title="Connect a wallet" class="TextBlock">
            <div v-if="walletAddress" class="text-gray-800">
                The operation will be carried over the connected wallet <format-address :value="walletAddress" />
            </div>
            <div v-else class="text-gray-800">
                To participate in the auction, you need to connect a wallet. If you don’t have a wallet yet, you can
                simply sign up for it on a service like
                <a href="https://metamask.io/" target="_blank">MetaMask</a>.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button v-if="state === 'notConnected'" class="w-56" type="primary" @click="$emit('connectWallet')">
                Connect a wallet
            </base-button>
            <base-button v-if="state === 'connecting'" class="w-56" type="primary" is-loading>
                Connecting...
            </base-button>
            <base-button v-if="state === 'connected'" class="w-56" @click="$emit('disconnectWallet')">
                Disconnect
            </base-button>
            <base-button v-if="state === 'disconnecting'" class="w-56" is-loading> Disconnecting... </base-button>
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
