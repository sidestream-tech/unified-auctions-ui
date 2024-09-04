<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="WalletAuthorizationCheckPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            You need to authorize a certain
            <Explain text="smart contract">
                The particular smart contract is called DaiJoin and its technical specification can be found
                <a href="https://github.com/makerdao/dss/blob/master/src/join.sol#L106-L142" target="_blank">here</a>
            </Explain>
            to modify your internal DAI
            <Explain text="balance">
                The core vault engine of the Maker Protocol is called VAT and manages the central accounting invariants
                of DAI. More information on the VAT can be found
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation#2-contract-details"
                    target="_blank"
                    >here</a
                > </Explain
            >, this operation should only be done once.
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :is-loading="isLoading"
                :disabled="disabled || isWalletAuthorized || !walletAddress"
                @click="$emit('authorizeWallet')"
            >
                <span v-if="isLoading">Authorizing...</span>
                <span v-else-if="!isWalletAuthorized">Authorize DAI Transactions</span>
                <span v-else>Already authorized</span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        Explain,
    },
    props: {
        isWalletAuthorized: {
            type: Boolean,
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
        walletAddress: {
            type: String,
            default: '',
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (!this.walletAddress) {
                return {
                    name: 'inactive',
                    title: 'The DAI authorization is unknown until a wallet is connected',
                };
            }
            if (!this.isWalletAuthorized) {
                return {
                    name: this.disabled ? 'inactive' : 'incorrect',
                    title: 'The wallet is not yet authorized to execute DAI transactions',
                };
            }
            return {
                name: 'correct',
                title: 'The wallet is authorized to execute DAI transactions',
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
