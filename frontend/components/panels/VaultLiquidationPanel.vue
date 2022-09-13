<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown"
            >A vault can be liquidated into a collateral auction if the liquidation limits are not reached. The
            liquidation incentives will be transferred to the connected wallet. You can also choose another wallet for
            that transfer.</TextBlock
        >
        <div class="flex mt-4 justify-end gap-5">
            <BaseButton
                :disabled="!isLiquidatable || areLimitsMissing || areLimitsReached || isLiquidating"
                @click="$emit('chooseWallet')"
            >
                Liquidate to another wallet
            </BaseButton>
            <BaseButton
                type="primary"
                :disabled="!isWalletConnected || !isLiquidatable || areLimitsMissing || areLimitsReached"
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
        incentiveRelativeDai: {
            type: BigNumber,
            required: true,
        },
        incentiveConstantDai: {
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
            if (!this.isWalletConnected) {
                return {
                    name: 'inactive',
                    title: 'Vault is ready to be liquidated, but no wallet is connected',
                };
            }
            if (this.areLimitsMissing) {
                return {
                    name: 'inactive',
                    title: 'Vault is ready to be liquidated, but current liquidation limits are not known',
                };
            }
            if (this.areLimitsReached) {
                return {
                    name: 'inactive',
                    title: 'Vault is ready to be liquidated, but current liquidation limits are reached',
                };
            }
            return {
                name: 'notice',
                title: 'Vault is ready to be liquidated',
            };
        },
        isLiquidatable(): Boolean {
            return this.auctionState === 'liquidatable';
        },
        debtAndIncentives(): BigNumber {
            return this.debtDai.plus(this.incentiveRelativeDai).plus(this.incentiveConstantDai);
        },
        areLimitsMissing(): boolean {
            return Object.values(this.liquidationLimits).reduce((prev, curr) => !prev || !curr, true);
        },
        globalDifference(): BigNumber {
            return this.liquidationLimits.maximumProtocolDebtDai
                .minus(this.liquidationLimits.currentProtocolDebtDai)
                .minus(this.debtAndIncentives);
        },
        collateralDifference(): BigNumber {
            return this.liquidationLimits.maximumCollateralDebtDai
                .minus(this.liquidationLimits.currentCollateralDebtDai)
                .minus(this.debtAndIncentives);
        },
        areLimitsReached(): Boolean {
            if (this.globalDifference.isNegative() || this.collateralDifference.isNegative()) {
                return true;
            }
            return false;
        },
    },
});
</script>
