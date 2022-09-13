<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div class="flex justify-between">
            <div>Proximity to liquidation threshold</div>
            <div>
                <span v-if="auction.proximityToLiquidation < 0" class="text-green-500"
                    >(Ready for liquidation) {{ auction.proximityToLiquidation }}%</span
                >
                <span v-else>{{ auction.proximityToLiquidation }}%</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Next price update</div>
            <div class="flex items-center space-x-1">
                <AnimatedArrow :direction="getIsPriceGoingUpOrDown" class="h-3" />
                <span>in <TimeTill :date="auction.nextPriceChange" /></span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Debt</div>
            <div><FormatCurrency :value="auction.debtDai" currency="DAI" /></div>
        </div>
        <div class="flex justify-between">
            <div>
                <Explain text="Liquidation incentive relative"
                    >A variable collateral-based reward for liquidators set by the
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#liquidation-incentive-mechanism"
                        target="blank"
                        >incentive mechanism</a
                    >, which scales linearly with the amount of debt associated with the liquidation</Explain
                >
                <span v-if="auction.incentiveRelativeDai" class="opacity-50"
                    >(~ {{ incentiveRelativePercentage }} for {{ auction.collateralType }})</span
                >
            </div>
            <div>
                <FormatCurrency
                    v-if="auction.incentiveRelativeDai"
                    :value="auction.incentiveRelativeDai"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>
                <Explain text="Liquidation incentive constant"
                    >A constant collateral-based reward for liquidators set by the
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#liquidation-incentive-mechanism"
                        target="blank"
                        >incentive mechanism</a
                    ></Explain
                >
            </div>
            <div>
                <FormatCurrency
                    v-if="auction.incentiveConstantDai"
                    :value="auction.incentiveConstantDai"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>Potential gross profit</div>
            <div>
                +<FormatCurrency v-if="auction.grossProfitDai" :value="auction.grossProfitDai" currency="DAI" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between">
            <div>
                <Explain text="Combined Transaction Fees" />
                <span v-if="auction.transactionFeeLiquidationDai" class="opacity-50"
                    >(~ <FormatCurrency :value="auction.transactionFeeLiquidationEth" currency="ETH" />)</span
                >
            </div>
            <div>
                -<FormatCurrency
                    v-if="auction.transactionFeeLiquidationDai"
                    :value="auction.transactionFeeLiquidationDai"
                    currency="DAI"
                />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
        <div class="flex justify-between font-bold">
            <div>Potential net profit</div>
            <div>
                <FormatCurrency v-if="auction.netProfitDai" :value="auction.netProfitDai" currency="DAI" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VaultTransactionNotLiquidated } from 'auctions-core/src/types';
import { formatToAutomaticDecimalPoints } from 'auctions-core/src/helpers/formatToAutomaticDecimalPoints';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import Explain from '~/components/common/other/Explain.vue';
import AnimatedArrow, { ArrowDirections } from '~/components/common/other/AnimatedArrow.vue';

export default Vue.extend({
    components: {
        TimeTill,
        FormatCurrency,
        Explain,
        AnimatedArrow,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<VaultTransactionNotLiquidated>,
            required: true,
        },
    },
    computed: {
        incentiveRelativePercentage(): String {
            return (
                formatToAutomaticDecimalPoints(
                    this.auction.incentiveRelativeDai.div(this.auction.debtDai).times(100)
                ) + '%'
            );
        },
        getIsPriceGoingUpOrDown(): ArrowDirections {
            if (this.auction.nextUnitPrice.isGreaterThan(this.auction.currentUnitPrice)) {
                return 'up';
            }
            return 'down';
        },
    },
});
</script>
