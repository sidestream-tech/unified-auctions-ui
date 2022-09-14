<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown"
            >A vault can be liquidated into a collateral auction if the liquidation limits are not reached. The
            liquidation incentives will be transferred to the connected wallet. You can also choose another wallet for
            that transfer.</TextBlock
        >
        <div class="flex mt-4 justify-end gap-5">
            <ExecuteWithOtherWalletModal
                :is-shown.sync="isExecuteToAnotherWalletModalShown"
                :default-wallet="walletAddress"
                class="pb-3"
                @execute="executeWithOtherWallet"
                @close="closeExecuteToOtherWalletModal"
            />
            <BaseButton
                :disabled="!isWalletConnected || !isLiquidatable || areLimitsMissing || areLimitsReached"
                @click="isExecuteToAnotherWalletModalShown = true"
            >
                Liquidate to another wallet
            </BaseButton>
            <BaseButton
                type="primary"
                :disabled="!isWalletConnected || !isLiquidatable || areLimitsMissing || areLimitsReached"
                :is-loading="isLiquidating"
                @click="$emit('liquidate', walletAddress)"
            >
                Liquidate {{ collateralType }}:{{ auctionId }} vault
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import ExecuteWithOtherWalletModal from '../modals/ExecuteWithOtherWalletModal.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import { LiquidationLimits, VaultTransactionState } from '~/../core/src/types';

export default Vue.extend({
    name: 'VaultLiquidationPanel',
    components: {
        ExecuteWithOtherWalletModal,
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
        walletAddress: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            isExecuteToAnotherWalletModalShown: false,
        };
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
            if (!this.liquidationLimits) {
                return true;
            }
            return (
                Object.values(this.liquidationLimits).includes(null) ||
                Object.values(this.liquidationLimits).length !== 4
            );
        },
        globalDifference(): BigNumber | undefined {
            if (this.areLimitsMissing) {
                return undefined;
            }
            return this.liquidationLimits.maximumProtocolDebtDai
                .minus(this.liquidationLimits.currentProtocolDebtDai)
                .minus(this.debtAndIncentives);
        },
        collateralDifference(): BigNumber | undefined {
            if (this.areLimitsMissing) {
                return undefined;
            }
            return this.liquidationLimits.maximumCollateralDebtDai
                .minus(this.liquidationLimits.currentCollateralDebtDai)
                .minus(this.debtAndIncentives);
        },
        areLimitsReached(): Boolean {
            return this.globalDifference.isNegative() || this.collateralDifference.isNegative();
        },
    },
    methods: {
        closeExecuteToOtherWalletModal() {
            this.isExecuteToAnotherWalletModalShown = false;
        },
        executeWithOtherWallet(wallet: string | undefined) {
            this.$emit('liquidate', wallet);
        },
    },
});
</script>
