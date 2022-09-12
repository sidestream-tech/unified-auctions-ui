<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown"></TextBlock>
        <div class="flex justify-between mt-4">
            <span>Current global limit</span>
            <span v-if="!isGlobalLimitMissing"
                ><Explain :text="format(liquidationLimits.maximumProtocolDebtDai)"
                    >The maximum amount of DAI allowed to cover the debt and fees of all active auctions</Explain
                >
                -
                <Explain :text="format(liquidationLimits.currentProtocolDebtDai)"
                    >The amount of DAI needed to cover the debt and fees of all active auctions</Explain
                >
                -
                <Explain :text="format(debtDai)">The amount of DAI that will be auctioned after liquidation</Explain>
                = <FormatCurrency :value="globalDifference" currency="DAI"
            /></span>
            <div v-else>
                <span class="opacity-50">Unknown</span>
                <span>DAI</span>
            </div>
        </div>
        <div class="flex justify-between">
            <span>Current {{ collateralType }} limit</span>
            <span v-if="!isCollateralLimitMissing"
                ><Explain :text="format(liquidationLimits.maximumCollateralDebtDai)"
                    >The maximum amount of DAI allowed to cover the debt and fees of all active
                    {{ collateralType }} auctions</Explain
                >
                -
                <Explain :text="format(liquidationLimits.currentCollateralDebtDai)"
                    >The amount of DAI needed to cover the debt and fees of all active
                    {{ collateralType }} auctions</Explain
                >
                -
                <Explain :text="format(debtDai)">The amount of DAI that will be auctioned after liquidation</Explain>
                = <FormatCurrency :value="collateralDifference" currency="DAI"
            /></span>
            <div v-else>
                <span class="opacity-50">Unknown</span>
                <span>DAI</span>
            </div>
        </div>
        <div class="flex justify-end mt-4">
            <BaseButton
                type="primary"
                :disabled="isRefreshing"
                :is-loading="isRefreshing"
                @click="$emit('refreshLimits')"
            >
                Refresh
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { LiquidationLimits } from 'auctions-core/src/types';
import { formatToAutomaticDecimalPoints } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';

export default Vue.extend({
    name: 'VaultLiquidationLimitsCheckPanel',
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        Explain,
        FormatCurrency,
    },
    props: {
        liquidationLimits: {
            type: Object as Vue.PropType<LiquidationLimits>,
            required: true,
        },
        debtDai: {
            type: BigNumber,
            required: true,
        },
        collateralType: {
            type: String,
            required: true,
        },
        isRefreshing: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        globalDifference(): BigNumber {
            return this.liquidationLimits.maximumProtocolDebtDai
                .minus(this.liquidationLimits.currentProtocolDebtDai)
                .minus(this.debtDai);
        },
        collateralDifference(): BigNumber {
            return this.liquidationLimits.maximumCollateralDebtDai
                .minus(this.liquidationLimits.currentCollateralDebtDai)
                .minus(this.debtDai);
        },
        isGlobalLimitMissing(): boolean {
            return !this.liquidationLimits.maximumProtocolDebtDai || !this.liquidationLimits.currentProtocolDebtDai;
        },
        isCollateralLimitMissing(): boolean {
            return (
                !this.liquidationLimits.maximumCollateralDebtDai || !this.liquidationLimits.currentCollateralDebtDai
            );
        },
        currentStateAndTitle(): PanelProps {
            if (this.isGlobalLimitMissing && this.isCollateralLimitMissing) {
                return {
                    name: 'inactive',
                    title: 'Liquidation limits are unknown',
                };
            }
            if (this.globalDifference.isNegative()) {
                return {
                    name: 'incorrect',
                    title: 'Current global liquidation limits are reached',
                };
            }
            if (this.collateralDifference.isNegative()) {
                return {
                    name: 'incorrect',
                    title: `Current ${this.collateralType} liquidation limits are reached`,
                };
            }
            return {
                name: 'correct',
                title: `Current global and ${this.collateralType} liquidation limits are not reached`,
            };
        },
    },
    methods: {
        format(value: BigNumber): string {
            return formatToAutomaticDecimalPoints(value);
        },
    },
});
</script>
