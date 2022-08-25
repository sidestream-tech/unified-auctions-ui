<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="WalletAuthorizationCheckPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            You need to authorize the
            <Explain text="debt auction contract">
                The particular smart contract is called Flopper and its technical specification can be found
                <a href="https://github.com/makerdao/dss/blob/master/src/flop.sol" target="_blank">here</a>
            </Explain>
            to modify your DAI stored in VAT, this operation should only be done once.
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :is-loading="isLoading"
                :disabled="disabled || isDebtAuctionAuthorized || !walletAddress"
                @click="$emit('authorizeFlopper')"
            >
                <span v-if="isLoading">Authorizing...</span>
                <span v-else-if="!isDebtAuctionAuthorized">Authorize Flopper Transactions</span>
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
        isDebtAuctionAuthorized: {
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
            if (!this.isDebtAuctionAuthorized) {
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
