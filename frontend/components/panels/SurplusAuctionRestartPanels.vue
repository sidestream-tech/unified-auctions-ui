<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="SurplusAuctionRestartPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>

        <TextBlock v-if="isExplanationsShown">
            Auction that was started but hasn't received a single bid in the allotted time. When restarted bids can be
            placed again.
        </TextBlock>

        <WalletConnectionCheckPanel
            class="my-3"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            :is-loading="isConnecting"
            @connectWallet="$emit('connectWallet')"
            @disconnectWallet="$emit('disconnectWallet')"
        />

        <div class="flex justify-end gap-5">
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :disabled="isDisabled"
                :is-loading="isRestarting"
                @click="$emit('restart')"
            >
                <span v-if="isRestarting">Restarting...</span>
                <span v-else>Restart Auction</span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BasePanel from '../common/BasePanel.vue';
import TextBlock from '../common/TextBlock.vue';
import BaseButton from '../common/BaseButton.vue';
import WalletConnectionCheckPanel from './WalletConnectionCheckPanel.vue';

export default Vue.extend({
    name: 'SurplusAuctionRestartPanel',
    components: { WalletConnectionCheckPanel, BaseButton, TextBlock, BasePanel },
    props: {
        walletAddress: {
            type: String,
            default: null,
        },
        isRestarting: {
            type: Boolean,
            default: false,
        },
        isConnecting: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            return {
                name: 'incorrect',
                title: 'The auction is currently inactive.',
            };
        },
        isDisabled(): boolean {
            return this.disabled || !this.walletAddress;
        },
    },
});
</script>
