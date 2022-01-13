<template>
    <div class="flex flex-col items-center">
        <LandingBlock v-if="isExplanationsShown" class="LandingBlock">
            <h1 class="text-gray-800 dark:text-gray-100">
                Maker Protocol <br />
                Auctions Dashboard
            </h1>
        </LandingBlock>
        <div class="mt-4 md:mt-8 px-4 mb-4 md:mb-8 w-full max-w-screen-sm">
            <TextBlock v-if="isExplanationsShown" title="Collateral auction parameters">
                In the dutch-style auction system the step parameter defines for each collateral type the length of
                time between price drops (e.g. {{ exampleCollateral.secondsBetweenPriceDrops }} sec for
                {{ exampleCollateral.ilk }}). The cut parameter defines the percentage of each price drop (e.g.
                {{ exampleCollateral.priceDropRatio }}% for {{ exampleCollateral.ilk }}). The market price for the
                collateral on another marketplace like Uniswap is relevant as it determines the arbitrage opportunity.
                This arbitrage opportunity during an active auction is based on the price difference between the
                auction price and the price for the collateral on another marketplace.
            </TextBlock>
        </div>
        <CollateralTable :collaterals="collaterals" class="w-full px-4 overflow-x-scroll max-w-screen-md" />
    </div>
</template>

<script lang="ts">
import type { CollateralRow } from 'auctions-core/src/types';
import Vue from 'vue';
import CollateralTable from './CollateralTable.vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        LandingBlock,
        TextBlock,
        CollateralTable,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        collaterals: {
            type: Array as Vue.PropType<CollateralRow[]>,
            default: () => [],
        },
    },
    computed: {
        exampleCollateral() {
            const example = this.collaterals.find(collateral => collateral.ilk === 'ETH-A');
            return {
                ilk: example?.ilk || 'ETH-A',
                secondsBetweenPriceDrops: example?.secondsBetweenPriceDrops || 90,
                priceDropRatio: example?.priceDropRatio || 1,
            };
        },
    },
});
</script>

<style scoped>
.LandingBlock {
    @apply w-full;

    min-height: 33vh;
}
</style>
