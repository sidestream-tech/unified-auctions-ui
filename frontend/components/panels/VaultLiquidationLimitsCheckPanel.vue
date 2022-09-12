<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown"></TextBlock>
        <div class="flex justify-between mt-4">
            <span>Current global limit</span>
            <span v-if="liquidationLimits"
                ><Explain :text="liquidationLimits.maximumProtocolDebtDai.toFixed()"></Explain> -
                <Explain :text="liquidationLimits.currentProtocolDebtDai.toFixed()"></Explain> -
                <Explain :text="debtDai.toFixed()"></Explain> =
                <FormatCurrency :value="globalDifference" currency="DAI"
            /></span>
            <div v-else>
                <span class="opacity-50">Unknown</span>
                <span>DAI</span>
            </div>
        </div>
        <div class="flex justify-between">
            <span>Current {{ collateralType }} limit</span>
            <span v-if="liquidationLimits"
                ><Explain :text="liquidationLimits.maximumCollateralDebtDai.toFixed()"></Explain> -
                <Explain :text="liquidationLimits.currentCollateralDebtDai.toFixed()"></Explain> -
                <Explain :text="debtDai.toFixed()"></Explain> =
                <FormatCurrency :value="collateralDifference" currency="DAI"
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
        currentStateAndTitle(): PanelProps {
            if (!this.liquidationLimits) {
                return {
                    name: 'inactive',
                    title: 'No liquidation limits are provided',
                };
            }
            if (this.globalDifference.isNegative()) {
                return {
                    name: 'incorrect',
                    title: 'Current global liquidation limits are reached, please wait for them to lower',
                };
            }
            if (this.collateralDifference.isNegative()) {
                return {
                    name: 'incorrect',
                    title: `Current ${this.collateralType} liquidation limits are reached, please wait for them to lower`,
                };
            }
            return {
                name: 'correct',
                title: `Current global and ${this.collateralType} liquidation limits are not reached`,
            };
        },
    },
});
</script>
