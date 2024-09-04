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
                = <FormatCurrency :value="globalLimit" currency="DAI"
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
                = <FormatCurrency :value="collateralLimit" currency="DAI"
            /></span>
            <div v-else>
                <span class="opacity-50">Unknown</span>
                <span>DAI</span>
            </div>
        </div>
        <div class="flex justify-between">
            <span>Maximal liquidatable amount</span>
            <FormatCurrency v-if="maximalLiquidatableAmount" :value="maximalLiquidatableAmount" currency="DAI" />
            <div v-else>
                <span class="opacity-50">Unknown</span>
                <span>DAI</span>
            </div>
        </div>
        <div class="flex justify-between">
            <span>Liquidation penalty ratio</span>
            <div>
                <FormatCurrency
                    v-if="vaultTransaction.liquidationPenaltyRatio"
                    :value="liquidationPenaltyPercentage"
                />
                <span v-else class="opacity-50">Unknown</span> &#37;
            </div>
        </div>
        <div class="mt-2">
            <hr class="mb-1" />
            <div class="flex justify-between">
                <span class="font-bold">Will be liquidated</span>
                <div>
                    <span v-if="willBeLiquidated">
                        <FormatCurrency :value="willBeLiquidated" /> of
                        <FormatCurrency :value="vaultTransaction.debtDai" currency="DAI" />
                    </span>
                    <div v-else>
                        <span class="opacity-50">Unknown</span>
                        <span>DAI</span>
                    </div>
                </div>
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
        isBelowMinimal(): boolean {
            return (
                this.vaultTransaction.debtDai.isLessThan(this.vaultTransaction.minimalAuctionedDai) ||
                this.willBeLiquidated?.isLessThan(this.vaultTransaction.minimalAuctionedDai) ||
                this.partialLiquidationLeftover.isLessThan(this.vaultTransaction.minimalAuctionedDai)
            );
        },
        partialLiquidationLeftover(): BigNumber {
            if (!this.willBeLiquidated) {
                return this.vaultTransaction.debtDai;
            }
            return this.vaultTransaction.debtDai.minus(this.willBeLiquidated);
        },
        liquidationPenaltyPercentage(): BigNumber {
            return this.vaultTransaction.liquidationPenaltyRatio.minus(1).times(100);
        },
        debtTimesPenaltyRatio(): BigNumber {
            return this.vaultTransaction.debtDai.times(this.vaultTransaction.liquidationPenaltyRatio);
        },
        globalLimit(): BigNumber {
            return this.vaultTransaction.maximumProtocolDebtDai.minus(this.vaultTransaction.currentProtocolDebtDai);
        },
        collateralLimit(): BigNumber {
            return this.vaultTransaction.maximumCollateralDebtDai.minus(
                this.vaultTransaction.currentCollateralDebtDai
            );
        },
        globalDifference(): BigNumber {
            return this.globalLimit.minus(this.debtTimesPenaltyRatio);
        },
        collateralDifference(): BigNumber {
            return this.collateralLimit.minus(this.debtTimesPenaltyRatio);
        },
        maximalLiquidatableAmount(): BigNumber | undefined {
            if (
                this.isGlobalLimitMissing ||
                this.isCollateralLimitMissing ||
                !this.vaultTransaction.liquidationPenaltyRatio
            ) {
                return undefined;
            }
            if (
                this.globalDifference.isGreaterThanOrEqualTo(0) &&
                this.collateralDifference.isGreaterThanOrEqualTo(0)
            ) {
                return this.vaultTransaction.debtDai;
            }
            if (this.globalLimit.isLessThanOrEqualTo(this.collateralLimit)) {
                return this.globalLimit;
            } else {
                return this.collateralLimit;
            }
        },
        willBeLiquidated(): BigNumber | undefined {
            if (this.isGlobalLimitMissing || this.isCollateralLimitMissing) {
                return undefined;
            }
            if (this.globalDifference.isNegative() || this.collateralDifference.isNegative()) {
                if (this.globalLimit.isLessThanOrEqualTo(this.collateralLimit)) {
                    return this.globalLimit.div(this.vaultTransaction.liquidationPenaltyRatio);
                } else {
                    return this.collateralLimit.div(this.vaultTransaction.liquidationPenaltyRatio);
                }
            }
            return this.vaultTransaction.debtDai;
        },
        currentStateAndTitle(): PanelProps {
            if (this.isGlobalLimitMissing || this.isCollateralLimitMissing) {
                return {
                    name: 'inactive',
                    title: 'Current liquidation limits are unknown',
                };
            }
            if (this.globalDifference.isNegative()) {
                if (!this.isBelowMinimal) {
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
                if (!this.isBelowMinimal) {
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
                    newCurrentStateAndTitle.name === 'correct' || newCurrentStateAndTitle.name === 'attention'
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
