<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="isExplanationsShown">
            If you do not have a wallet yet, you can simply sign up for it on a service like
            <a href="https://metamask.io/" target="_blank">MetaMask</a>.
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton
                v-if="!walletAddress"
                type="primary"
                :is-loading="isLoading"
                :disabled="disabled"
                @click="$emit('connectWallet')"
            >
                <span v-if="isLoading">Connecting...</span>
                <span v-else>Connect a wallet</span>
            </BaseButton>
            <BaseButton v-else :is-loading="isLoading" :disabled="disabled" @click="$emit('disconnectWallet')">
                <span v-if="isLoading">Disconnecting...</span>
                <span v-else>Disconnect wallet <format-address disable shorten :value="walletAddress" /></span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseButton from '~/components/common/BaseButton.vue';
import BasePanel from '~/components/common/BasePanel.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        FormatAddress,
    },
    props: {
        walletAddress: {
            type: String,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
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
            if (!this.walletAddress) {
                return {
                    name: 'incorrect',
                    title: 'No wallet is connected',
                };
            }
            return {
                name: 'correct',
                title: `A wallet is connected`,
            };
        },
    },
    watch: {
        currentStateAndTitle: {
            immediate: true,
            handler(newCurrentStateAndTitle) {
                this.$emit('update:isCorrect', newCurrentStateAndTitle.name === 'correct');
            },
        },
    },
});
</script>
