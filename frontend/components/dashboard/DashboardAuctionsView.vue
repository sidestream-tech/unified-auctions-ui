<template>
    <div class="flex flex-col items-center">
        <LandingBlock v-if="isExplanationsShown" class="LandingBlock">
            <h1 class="text-gray-800 dark:text-gray-100">
                Maker Protocol <br />
                Auctions Dashboard
            </h1>
        </LandingBlock>
        <div class="Block max-w-screen-sm">
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
        <div class="Block max-w-screen-xl">
            <CollateralTable :collaterals="collaterals" class="overflow-x-auto" />
        </div>
        <div class="Block space-y-4 md:space-y-8 max-w-screen-sm">
            <TextBlock v-if="isExplanationsShown" title="Exchange Callee Contracts">
                Exchange callee contracts are smart contracts that facilitate the interaction with the Maker Protocol
                and decentralized exchanges. They are used in order to enable flash loan based auction participation.
            </TextBlock>
            <CalleeTable :callees="callees" />
        </div>
        <div class="Block space-y-4 md:space-y-8 max-w-screen-sm">
            <TextBlock v-if="isExplanationsShown" title="Gas prices">
                These are the current gas prices on your selected network.
            </TextBlock>
            <GasTable
                :base-fee-per-gas="baseFeePerGas"
                :gas-parameters="gasParameters"
                :transaction-fees="transactionFees"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { CollateralRow, CalleeAddresses, GasParameters, TransactionFees } from 'auctions-core/src/types';
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import CollateralTable from '~/components/dashboard/CollateralTable.vue';
import CalleeTable from '~/components/dashboard/CalleeTable.vue';
import GasTable from '~/components/dashboard/GasTable.vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    components: {
        GasTable,
        LandingBlock,
        TextBlock,
        CollateralTable,
        CalleeTable,
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
        callees: {
            type: Object as Vue.PropType<CalleeAddresses>,
            default: () => ({}),
        },
        baseFeePerGas: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        gasParameters: {
            type: Object as Vue.PropType<GasParameters>,
            default: undefined,
        },
        transactionFees: {
            type: Object as Vue.PropType<TransactionFees>,
            default: undefined,
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

.Block {
    @apply mt-4 md:mt-8 px-4 w-full;
}
</style>
