<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            Successful liquidation of the vault will transfer combined incentive into the wallet that executes the
            transaction (or a specified wallet). This transaction will start a collateral auction that one can also
            participate in on a
            <nuxt-link :to="`/collateral?network=${network}`">separate page</nuxt-link>.
        </TextBlock>
        <div class="flex mt-4 justify-end gap-5">
            <ExecuteWithOtherWalletModal
                :is-shown.sync="isExecuteToAnotherWalletModalShown"
                :default-wallet="walletAddress"
                class="pb-3"
                @execute="executeWithOtherWallet"
            />
            <BaseButton
                :disabled="!isLiquidatable || disabled"
                :is-loading="isLiquidating"
                @click="isExecuteToAnotherWalletModalShown = true"
            >
                Liquidate to another wallet
            </BaseButton>
            <BaseButton
                type="primary"
                :disabled="!isLiquidatable || disabled"
                :is-loading="isLiquidating"
                @click="$emit('liquidate', walletAddress)"
            >
                <span>Liquidate vault&nbsp;<FormatAddress shorten :value="vaultAddress" /></span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { VaultTransactionState } from 'auctions-core/src/types';
import ExecuteWithOtherWalletModal from '../modals/ExecuteWithOtherWalletModal.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

export default Vue.extend({
    name: 'VaultLiquidationPanel',
    components: {
        ExecuteWithOtherWalletModal,
        BaseButton,
        BasePanel,
        TextBlock,
        FormatAddress,
    },
    props: {
        vaultAddress: {
            type: String,
            required: true,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
        vaultState: {
            type: String as Vue.PropType<VaultTransactionState>,
            required: true,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLiquidating: {
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
            isExecuteToAnotherWalletModalShown: false,
        };
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (this.vaultState === 'liquidated') {
                return {
                    name: 'inactive',
                    title: 'The vault has been liquidated',
                };
            }
            if (!this.isLiquidatable) {
                return {
                    name: 'inactive',
                    title: 'Vault is not ready to be liquidated',
                };
            }
            if (this.disabled || !this.walletAddress) {
                return {
                    name: 'inactive',
                    title: 'Vault is ready to be liquidated',
                };
            }
            return {
                name: 'notice',
                title: 'Vault is ready to be liquidated',
            };
        },
        isLiquidatable(): Boolean {
            return this.vaultState === 'liquidatable';
        },
    },
    methods: {
        executeWithOtherWallet(wallet: string | undefined) {
            this.isExecuteToAnotherWalletModalShown = false;
            this.$emit('liquidate', wallet);
        },
    },
});
</script>
