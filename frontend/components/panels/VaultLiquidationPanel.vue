<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown"></TextBlock>
        <div class="flex my-4 justify-end gap-5">
            <BaseButton
                :disabled="!isLiquidatable || isGlobalLimitsReached || isLiquidating"
                @click="$emit('chooseWallet')"
            >
                Liquidate to another wallet
            </BaseButton>
            <BaseButton
                type="primary"
                :disabled="!isWalletConnected || !isLiquidatable || isGlobalLimitsReached"
                :is-loading="isLiquidating"
                @click="$emit('liquidate')"
            >
                Liquidate {{ collateralType }}:{{ auctionId }} vault
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import { LiquidationLimits, VaultTransactionState } from '~/../core/src/types';

export default Vue.extend({
    name: 'VaultLiquidationPanel',
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
    },
    props: {
        auctionId: {
            type: String,
            default: undefined,
        },
        auctionState: {
            type: String as Vue.PropType<VaultTransactionState>,
            required: true,
        },
        collateralType: {
            type: String,
            required: true,
        },
        debtDai: {
            type: BigNumber,
            required: true,
        },
        liquidationLimits: {
            type: Object as Vue.PropType<LiquidationLimits>,
            required: true,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isWalletConnected: {
            type: Boolean,
            default: false,
        },
        isLiquidating: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (!this.isLiquidatable) {
                return {
                    name: 'inactive',
                    title: 'Vault is not ready to be liquidated',
                };
            }
            if (this.isLiquidatable && this.isGlobalLimitsReached) {
                return {
                    name: 'inactive',
                    title: 'Vault is ready to be liquidated, but global limits are reached',
                };
            }
            return {
                name: 'notice',
                title: 'Vault is ready to be liquidated',
            };
        },
        isLiquidatable(): Boolean {
            return this.isWalletConnected && this.auctionState === 'liquidatable';
        },
        isGlobalLimitsReached(): Boolean {
            if (
                this.liquidationLimits.maximumProtocolDebtDai
                    .minus(this.liquidationLimits.currentProtocolDebtDai)
                    .minus(this.debtDai)
                    .isNegative()
            ) {
                return true;
            }
            if (
                this.liquidationLimits.maximumCollateralDebtDai
                    .minus(this.liquidationLimits.currentCollateralDebtDai)
                    .minus(this.debtDai)
                    .isNegative()
            ) {
                return true;
            }
            return false;
        },
    },
});
</script>
