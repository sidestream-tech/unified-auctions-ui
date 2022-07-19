<template>
    <span v-if="auction.isActive && !auction.isFinished && auction.secondsTillNextPriceDrop">
        <Popover :placement="placement">
            <template slot="content">
                <div class="text-center">
                    <p>
                        Price in
                        <span v-if="auction.secondsTillNextPriceDrop !== undefined" class="font-semibold"
                            >{{ auction.secondsTillNextPriceDrop.toFixed() }} s</span
                        >
                        <span v-else class="font-semibold"> N/A </span>
                    </p>
                    <p>
                        <FormatCurrency :value="nextPrice.toNumber()" currency="DAI" /> per
                        <FormatCurrency :currency="auction.collateralSymbol" />
                    </p>
                </div>
            </template>
            <Progress
                type="circle"
                class="progress-bar"
                :width="20"
                :stroke-width="15"
                :percent="percent"
                :show-info="false"
            />
        </Popover>
    </span>
</template>

<script lang="ts">
import type { AuctionTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { Progress, Popover } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    name: 'PriceDropAnimation',
    components: { FormatCurrency, Progress, Popover },
    props: {
        auction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        placement: {
            type: String,
            default: 'top',
        },
    },
    computed: {
        percent(): number {
            if (
                this.auction.secondsTillNextPriceDrop === undefined ||
                this.auction.secondsBetweenPriceDrops === undefined
            ) {
                return 0;
            }
            return 100 - (this.auction.secondsTillNextPriceDrop / this.auction.secondsBetweenPriceDrops) * 100;
        },
        nextPrice(): BigNumber {
            if (this.auction.priceDropRatio === undefined) {
                return new BigNumber(0);
            }
            return this.auction.approximateUnitPrice.multipliedBy(this.auction.priceDropRatio);
        },
    },
});
</script>

<style scoped>
.progress-bar >>> .ant-progress-circle path {
    transition: all 1s linear 0s !important;
}

.progress-bar {
    @apply ml-2;
}
</style>
