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
            <div>
                <!--AnimatedArrow-->
                in <TimeTill :date="auction.nextPriceChange" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Debt</div>
            <div><FormatCurrency :value="auction.debtDai" currency="DAI" /></div>
        </div>
        <div class="flex justify-between">
            <div>
                <Explain text="Liquidation incentive relative" />
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
            <div><Explain text="Liquidation incentive constant" /></div>
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
                <FormatCurrency v-if="auction.grossProfitDai" :value="auction.grossProfitDai" currency="DAI" />
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
                <FormatCurrency
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
import type { VaultTransaction } from 'auctions-core/src/types';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        TimeTill,
        FormatCurrency,
        Explain,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<VaultTransaction>,
            required: true,
        },
    },
    computed: {
        incentiveRelativePercentage(): String {
            return this.auction.incentiveRelativeDai.div(this.auction.debtDai).times(100).toFixed(2) + '%';
        },
    },
});
</script>
