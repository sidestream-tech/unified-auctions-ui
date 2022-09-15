<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            The amount of auctioned DAI is limited globally and per collateral type. There are two types of limits:
            global limit which restricts maximum total amount of DAI owned by all active auctions; and the amount of
            DAI owed by active auctions of the same collateral type ({{ collateralType }} in this case). The limits go
            down when the liquidated vaults are successfully auctioned out in the collateral auctions.
        </TextBlock>
        <div class="flex justify-between mt-4">
            <span>Current global limit</span>
            <span v-if="!isGlobalLimitMissing">
                <Explain :text="format(liquidationLimits.maximumProtocolDebtDai)">
                    The maximum allowed amount of DAI needed to cover the debt and liquidation incentives of all active
                    auctions. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#dog-hole-rad"
                        target="_blank"
                        >dog.Hole</a
                    >
                </Explain>
                -
                <Explain :text="format(liquidationLimits.currentProtocolDebtDai)">
                    The amount of DAI needed to cover the debt and liquidation incentives of all active auctions. In
                    maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#limits-on-dai-needed-to-cover-debt-and-fees-of-active-auctions"
                        target="_blank"
                        >dog.Dirt</a
                    >
                </Explain>
                -
                <Explain :text="format(debtAndIncentives)">
                    The amount of DAI that will be auctioned after the current liquidation plus liquidation incentives
                    of this auction
                </Explain>
                = <FormatCurrency :value="globalDifference" currency="DAI"
            /></span>
            <div v-else>
                <span class="opacity-50">Unknown</span>
                <span>DAI</span>
            </div>
        </div>
        <div class="flex justify-between">
            <span>Current {{ collateralType }} limit</span>
            <span v-if="!isCollateralLimitMissing">
                <Explain :text="format(liquidationLimits.maximumCollateralDebtDai)">
                    The amount of DAI needed to cover the debt and liquidation incentives of active
                    {{ collateralType }} auctions. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#dog-ilk.hole-rad"
                        target="_blank"
                        >ilk.hole</a
                    >
                </Explain>
                -
                <Explain :text="format(liquidationLimits.currentCollateralDebtDai)">
                    The amount of DAI needed to cover the debt and liquidation incentives of active
                    {{ collateralType }} auctions. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#limits-on-dai-needed-to-cover-debt-and-fees-of-active-auctions"
                        target="_blank"
                        >ilk.dirt</a
                    >
                </Explain>
                -
                <Explain :text="format(debtAndIncentives)">
                    The amount of DAI that will be auctioned after the current liquidation plus liquidation incentives
                    of this auction
                </Explain>
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
        debtAndIncentives(): BigNumber {
            return this.debtDai.plus(this.incentiveRelativeDai).plus(this.incentiveConstantDai);
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
        isGlobalLimitMissing(): boolean {
            return !this.liquidationLimits.maximumProtocolDebtDai || !this.liquidationLimits.currentProtocolDebtDai;
        },
        isCollateralLimitMissing(): boolean {
            return (
                !this.liquidationLimits.maximumCollateralDebtDai || !this.liquidationLimits.currentCollateralDebtDai
            );
        },
        currentStateAndTitle(): PanelProps {
            if (this.isGlobalLimitMissing || this.isCollateralLimitMissing || !this.debtAndIncentives) {
                return {
                    name: 'inactive',
                    title: 'Current liquidation limits are unknown',
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
    watch: {
        currentStateAndTitle: {
            immediate: true,
            handler(newCurrentStateAndTitle) {
                this.$emit('update:isCorrect', newCurrentStateAndTitle.name === 'correct');
            },
        },
    },
    methods: {
        format(value: BigNumber): string {
            return formatToAutomaticDecimalPoints(value);
        },
    },
});
</script>
