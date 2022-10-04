<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            The amount of auctioned DAI is limited globally and per collateral type. There are two types of limits:
            global limit which restricts maximum total amount of DAI owned by all active auctions; and the amount of
            DAI owed by active auctions of the same collateral type ({{ vaultTransaction.collateralType }} in this
            case). The limits go down when the liquidated vaults are successfully auctioned out in the collateral
            auctions.
        </TextBlock>
        <div class="flex justify-between mt-4">
            <span>Current global limit</span>
            <span v-if="!isGlobalLimitMissing">
                <Explain :text="format(vaultTransaction.maximumProtocolDebtDai)">
                    The maximum allowed amount of DAI needed to cover the debt and liquidation incentives of all active
                    auctions. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#dog-hole-rad"
                        target="_blank"
                        >dog.Hole</a
                    >
                </Explain>
                -
                <Explain :text="format(vaultTransaction.currentProtocolDebtDai)">
                    The amount of DAI needed to cover the debt and liquidation incentives of all active auctions. In
                    maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#limits-on-dai-needed-to-cover-debt-and-fees-of-active-auctions"
                        target="_blank"
                        >dog.Dirt</a
                    >
                </Explain>
                -
                <Explain :text="format(debtTimesPenaltyRatio)">
                    The vault's debt plus a liquidation penalty (including the liquidation incentives) relative to the
                    amount of debt
                </Explain>
                = <FormatCurrency :class="globalLimitColor" :value="globalDifference" currency="DAI"
            /></span>
            <div v-else>
                <span class="opacity-50">Unknown</span>
                <span>DAI</span>
            </div>
        </div>
        <div class="flex justify-between">
            <span>Current {{ vaultTransaction.collateralType }} limit</span>
            <span v-if="!isCollateralLimitMissing">
                <Explain :text="format(vaultTransaction.maximumCollateralDebtDai)">
                    The amount of DAI needed to cover the debt and liquidation incentives of active
                    {{ vaultTransaction.collateralType }} auctions. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#dog-ilk.hole-rad"
                        target="_blank"
                        >ilk.hole</a
                    >
                </Explain>
                -
                <Explain :text="format(vaultTransaction.currentCollateralDebtDai)">
                    The amount of DAI needed to cover the debt and liquidation incentives of active
                    {{ vaultTransaction.collateralType }} auctions. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#limits-on-dai-needed-to-cover-debt-and-fees-of-active-auctions"
                        target="_blank"
                        >ilk.dirt</a
                    >
                </Explain>
                -
                <Explain :text="format(debtTimesPenaltyRatio)">
                    The vault's debt plus a liquidation penalty (including the liquidation incentives) relative to the
                    amount of debt
                </Explain>
                = <FormatCurrency :class="collateralLimitColor" :value="collateralDifference" currency="DAI"
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
import { VaultTransactionNotLiquidated } from 'auctions-core/src/types';
import { formatToAutomaticDecimalPoints } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';

export default Vue.extend({
    name: 'VaultLiquidationLimitsCheckPanel',
    components: {
        BasePanel,
        TextBlock,
        Explain,
        FormatCurrency,
        BaseButton,
    },
    props: {
        vaultTransaction: {
            type: Object as Vue.PropType<VaultTransactionNotLiquidated>,
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
        isGlobalLimitMissing(): boolean {
            return !this.vaultTransaction.maximumProtocolDebtDai || !this.vaultTransaction.currentProtocolDebtDai;
        },
        isCollateralLimitMissing(): boolean {
            return !this.vaultTransaction.maximumCollateralDebtDai || !this.vaultTransaction.currentCollateralDebtDai;
        },
        debtTimesPenaltyRatio(): BigNumber {
            return this.vaultTransaction.debtDai.times(this.vaultTransaction.liquidationPenaltyRatio);
        },
        globalDifference(): BigNumber {
            return this.vaultTransaction.maximumProtocolDebtDai
                .minus(this.vaultTransaction.currentProtocolDebtDai)
                .minus(this.debtTimesPenaltyRatio);
        },
        collateralDifference(): BigNumber {
            return this.vaultTransaction.maximumCollateralDebtDai
                .minus(this.vaultTransaction.currentCollateralDebtDai)
                .minus(this.debtTimesPenaltyRatio);
        },
        globalLimitColor(): string {
            if (this.globalDifference.isNegative()) {
                if (this.vaultTransaction.state === 'liquidatable') {
                    return 'text-orange-500';
                }
                return 'text-red-500';
            }
            return 'text-current';
        },
        collateralLimitColor(): string {
            if (this.collateralDifference.isNegative()) {
                if (this.vaultTransaction.state === 'liquidatable') {
                    return 'text-orange-500';
                }
                return 'text-red-500';
            }
            return 'text-current';
        },
        currentStateAndTitle(): PanelProps {
            if (this.isGlobalLimitMissing || this.isCollateralLimitMissing || !this.debtTimesPenaltyRatio) {
                return {
                    name: 'inactive',
                    title: 'Current liquidation limits are unknown',
                };
            }
            if (this.globalDifference.isNegative()) {
                if (this.vaultTransaction.state === 'liquidatable') {
                    return {
                        name: 'attention',
                        title: 'Current global liquidation limits are partially reached',
                    };
                }
                return {
                    name: 'incorrect',
                    title: 'Current global liquidation limits are reached',
                };
            }
            if (this.collateralDifference.isNegative()) {
                if (this.vaultTransaction.state === 'liquidatable') {
                    return {
                        name: 'attention',
                        title: `Current ${this.vaultTransaction.collateralType} liquidation limits are partially reached`,
                    };
                }
                return {
                    name: 'incorrect',
                    title: `Current ${this.vaultTransaction.collateralType} liquidation limits are reached`,
                };
            }
            return {
                name: 'correct',
                title: `Current global and ${this.vaultTransaction.collateralType} liquidation limits are not reached`,
            };
        },
    },
    watch: {
        currentStateAndTitle: {
            immediate: true,
            handler(newCurrentStateAndTitle) {
                this.$emit(
                    'update:isCorrect',
                    newCurrentStateAndTitle.name === 'correct' || newCurrentStateAndTitle.name === 'partlyIncorrect'
                );
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
