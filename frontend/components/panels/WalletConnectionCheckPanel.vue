<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>
        <TextBlock v-if="isExplanationsShown">
            <div v-if="!walletAddress">
                To execute transactions, you need to connect a wallet. If you don’t have a wallet yet, you can sign up
                for it on a service like <a href="https://metamask.io/" target="_blank">MetaMask</a>.
            </div>
            <div v-else>
                All transactions will be carried over the connected wallet
                <format-address shorten :value="walletAddress" type="address" />
            </div>
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton
                v-if="!walletAddress"
                class="w-full md:w-80"
                type="primary"
                :is-loading="isLoading"
                :disabled="disabled"
                @click="$emit('connectWallet')"
            >
                <span v-if="isLoading">Connecting...</span>
                <span v-else>Connect a wallet</span>
            </BaseButton>
            <BaseButton
                v-else
                class="w-full md:w-80"
                :is-loading="isLoading"
                :disabled="disabled"
                @click="$emit('disconnectWallet')"
            >
                <span v-if="isLoading">Disconnecting...</span>
                <span v-else>Disconnect wallet <format-address disable shorten :value="walletAddress" /></span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

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
            default: null,
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
