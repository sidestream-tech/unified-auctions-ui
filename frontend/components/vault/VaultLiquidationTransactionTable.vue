<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div class="flex justify-between">
            <div>Proximity to liquidation threshold</div>
            <div>
                <span v-if="vaultTransaction.proximityToLiquidation < 0" class="text-green-500 mr-1">
                    (Ready for liquidation)
                </span>
                <FormatPercentage :value="vaultTransaction.proximityToLiquidation" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Next price update</div>
            <div
                v-if="getIsPriceGoingUpOrDown && vaultTransaction.nextPriceChange && !isNextPriceChangeNaN"
                class="flex items-center space-x-1"
            >
                <AnimatedArrow :direction="getIsPriceGoingUpOrDown" class="h-3" />
                <span>in <TimeTill :date="vaultTransaction.nextPriceChange" /></span>
            </div>
            <div v-else class="opacity-50">Unknown</div>
        </div>
        <div class="flex justify-between">
            <div>Debt</div>
            <div>
                <FormatCurrency :value="vaultTransaction.debtDai" currency="DAI" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>
                <Explain text="Liquidation incentive relative">
                    The relative incentive parameter represents a reward in DAI paid to the user who liquidates the
                    vault. It is relative to vault size. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#clipper-chip-wad"
                        target="_blank"
                        >clip.chip</a
                    >.
                </Explain>
                <span class="opacity-50"
                    >(~ <format-percentage :value="incentiveRelativePercentage" /> for
                    {{ vaultTransaction.collateralType }})</span
                >
            </div>
            <div>
                <FormatCurrency :value="vaultTransaction.incentiveRelativeDai" currency="DAI" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>
                <Explain text="Liquidation incentive constant">
                    The constant incentive parameter represents a reward in DAI paid to the user who liquidates the
                    vault. It is constant for all liquidations of the same collateral type. In maker terms it is called
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#clipper-tip-rad"
                        target="_blank"
                    >
                        clip.tip</a
                    >.
                </Explain>
            </div>
            <div>
                <FormatCurrency :value="vaultTransaction.incentiveConstantDai" currency="DAI" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Potential gross profit</div>
            <div>+<FormatCurrency :value="vaultTransaction.grossProfitDai" currency="DAI" /></div>
        </div>
        <div class="flex justify-between">
            <div>
                Transaction fee
                <span class="opacity-50">
                    (~ <FormatCurrency :value="vaultTransaction.transactionFeeLiquidationEth" currency="ETH" />)
                </span>
            </div>
            <div>-<FormatCurrency :value="vaultTransaction.transactionFeeLiquidationDai" currency="DAI" /></div>
        </div>
        <div class="flex justify-between font-bold">
            <div>Potential net profit</div>
            <div>
                <FormatCurrency :value="vaultTransaction.netProfitDai" currency="DAI" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VaultTransactionNotLiquidated } from 'auctions-core/src/types';
import { formatToAutomaticDecimalPoints } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import FormatPercentage from '../common/formatters/FormatPercentage.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import Explain from '~/components/common/other/Explain.vue';
import AnimatedArrow, { ArrowDirections } from '~/components/common/other/AnimatedArrow.vue';

export default Vue.extend({
    components: {
        FormatPercentage,
        TimeTill,
        FormatCurrency,
        Explain,
        AnimatedArrow,
    },
    props: {
        vaultTransaction: {
            type: Object as Vue.PropType<VaultTransactionNotLiquidated>,
            required: true,
        },
    },
    computed: {
        incentiveRelativePercentage(): string {
            return formatToAutomaticDecimalPoints(
                this.vaultTransaction.incentiveRelativeDai.div(this.vaultTransaction.debtDai).times(100)
            );
        },
        getIsPriceGoingUpOrDown(): ArrowDirections | undefined {
            if (!this.vaultTransaction.nextUnitPrice || !this.vaultTransaction.currentUnitPrice) {
                return undefined;
            }
            if (this.vaultTransaction.nextUnitPrice.isGreaterThan(this.vaultTransaction.currentUnitPrice)) {
                return 'up';
            }
            return 'down';
        },
        isNextPriceChangeNaN(): boolean {
            return isNaN(new Date(this.vaultTransaction.nextPriceChange).getTime());
        },
    },
});
</script>
