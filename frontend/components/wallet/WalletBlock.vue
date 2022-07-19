<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Connect a wallet">
            <div v-if="walletAddress">
                The operation will be carried over the connected wallet
                <format-address shorten :value="walletAddress" type="address" />
            </div>
            <div v-else>
                To participate in the auction, you need to connect a wallet. If you don’t have a wallet yet, you can
                simply sign up for it on a service like
                <a href="https://metamask.io/" target="_blank">MetaMask</a>.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button
                v-if="state === 'notConnected'"
                class="w-full md:w-80"
                type="primary"
                @click="$emit('connectWallet')"
            >
                Connect a wallet
            </base-button>
            <base-button v-else-if="state === 'connecting'" class="w-full md:w-80" type="primary" is-loading>
                Connecting...
            </base-button>
            <base-button v-else-if="state === 'connected'" class="w-full md:w-80" @click="$emit('disconnectWallet')">
                <div>Disconnect wallet <format-address disable shorten :value="walletAddress" /></div>
            </base-button>
            <base-button v-else-if="state === 'disconnecting'" class="w-full md:w-80" is-loading>
                Disconnecting...
            </base-button>
            <base-button v-else disabled class="w-full md:w-80" type="primary"> Connect a wallet </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

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
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        state(): string {
            if (this.disabled) {
                return 'disabled';
            }
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
