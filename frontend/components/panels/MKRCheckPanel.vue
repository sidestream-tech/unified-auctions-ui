<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title> {{ currentStateAndTitle.title }} </template>

        <WalletMKRBalanceCheckPanel
            :wallet-m-k-r="walletMKR"
            :required-m-k-r="requiredMKR"
            :network="network"
            :token-address="tokenAddress"
            :is-loading="isRefreshing"
            :is-disabled="isDisabled"
            :is-explanations-shown="isExplanationsShown"
            :is-correct.sync="isWalletMKRCheckPassed"
            @refresh="$emit('refresh')"
        />
        <AllowanceAmountCheckPanel
            :is-loading="isLoading"
            :disabled="isDisabled"
            :allowance-amount="allowanceMKR"
            :desired-amount="requiredMKR"
            currency="MKR"
            :is-correct.sync="isAllowanceAmountCheckPassed"
            @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
        />
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BasePanel from '../common/BasePanel.vue';
import WalletMKRBalanceCheckPanel from './WalletMKRBalanceCheckPanel.vue';
import AllowanceAmountCheckPanel from './AllowanceAmountCheckPanel.vue';

export default Vue.extend({
    name: 'MKRCheckPanel',
    components: {
        AllowanceAmountCheckPanel,
        WalletMKRBalanceCheckPanel,
        BasePanel,
    },
    props: {
        walletMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        requiredMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        allowanceMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        tokenAddress: {
            type: String,
            required: true,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
        isRefreshing: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isWalletMKRCheckPassed: false,
            isAllowanceAmountCheckPassed: false,
        };
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (!this.walletMKR) {
                return {
                    name: 'inactive',
                    title: 'The amount of MKR is not present',
                };
            }
            if (!this.isWalletMKRCheckPassed) {
                return {
                    name: 'incorrect',
                    title: `The amount of MKR is not present in the connected wallet`,
                };
            }
            if (!this.isAllowanceAmountCheckPassed) {
                return {
                    name: 'incorrect',
                    title: `The amount exceeds allowance`,
                };
            }
            return {
                name: 'correct',
                title: `The amount of MKR is present and allowance is given`,
            };
        },
    },
    watch: {
        currentStateAndTitle: {
            immediate: true,
            handler(newCurrentStateAndTitle) {
                this.$emit('update:isCorrect', ['correct', 'notice'].includes(newCurrentStateAndTitle.name));
            },
        },
    },
});
</script>
