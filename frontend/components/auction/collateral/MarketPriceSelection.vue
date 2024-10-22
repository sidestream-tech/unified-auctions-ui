<template>
    <div>
        <div class="flex justify-between">
            <button class="Title" type="button" @click="isExpanded = !isExpanded">
                <Icon v-if="!isExpanded" type="caret-right" class="Icon" />
                <Icon v-else type="caret-down" class="Icon" />
                Market Unit Price
                <span class="text-gray-300">({{ suggestionOrSelection }})</span>
            </button>
            <div v-show="!isExpanded">
                <FormatCurrency :value="marketUnitPrice" :currency="profitToken" /> per
                <span class="uppercase">{{ auctionTransaction.tokenName }}</span>
            </div>
        </div>
        <CollapseTransition>
            <div v-show="isExpanded" class="Content overflow-x-auto">
                <table class="table-auto">
                    <tbody>
                        <tr v-for="[id, marketData] in marketDataArray" :key="id">
                            <td class="pr-2 whitespace-nowrap">{{ id }}</td>
                            <td class="pr-2 whitespace-nowrap">
                                {{ getRouteFromMarketData(marketData) }}
                            </td>
                            <td class="w-full text-right whitespace-nowrap">
                                <div v-if="marketData.errorMessage">
                                    <span class="text-red-500 truncate">Error: {{ marketData.errorMessage }}</span>
                                </div>
                                <div v-else-if="marketData.marketUnitPrice && !marketData.marketUnitPrice.isNaN()">
                                    <button type="button" @click="$emit('update:marketId', id)">
                                        <span v-if="suggestionOrSelection === id" class="opacity-50">Selected</span>
                                        <span v-else class="text-green-500">Select</span>
                                    </button>
                                    <span class="pl-1">
                                        <FormatCurrency :value="marketData.marketUnitPrice" :currency="profitToken" />
                                        per
                                        <span class="uppercase">{{ auctionTransaction.tokenName }}</span>
                                    </span>
                                </div>
                                <div v-else class="flex justify-end">
                                    <div v-if="isMarketIdAutorouted(id)" class="pr-1">
                                        <button
                                            type="button"
                                            @click="$emit('update:toggleAutoRouterLoad', auctionTransaction.id)"
                                        >
                                            <div v-if="isAutoroutingEnabled" class="flex">
                                                <span class="opacity-50 pr-2">Disable</span
                                                ><LoadingIcon
                                                    v-if="
                                                        !marketData.marketUnitPrice ||
                                                        marketData.marketUnitPrice.isNaN()
                                                    "
                                                    class="LoadingAutoRouter dark:text-gray-300"
                                                />
                                            </div>
                                            <span v-else class="text-green-500">Enable</span>
                                        </button>
                                    </div>
                                    <div class="opacity-50">Unknown</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </CollapseTransition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Icon } from 'ant-design-vue';
import CollapseTransition from '@ivanv/vue-collapse-transition';
import { AuctionTransaction, MarketData, Pool } from 'auctions-core/src/types';
import COLLATERALS from 'auctions-core/src/constants/COLLATERALS';
import LoadingIcon from '~/assets/icons/loading.svg';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    components: {
        Icon,
        FormatCurrency,
        CollapseTransition,
        LoadingIcon,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        profitToken: {
            type: String,
            required: true,
        },
        marketId: {
            type: String,
            default: '',
        },
        isAutoroutingEnabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isExpanded: false,
        };
    },
    computed: {
        suggestionOrSelection(): string | undefined {
            return this.marketId || this.auctionTransaction.suggestedMarketId;
        },
        marketUnitPrice(): BigNumber | undefined {
            if (this.auctionTransaction.marketDataRecords && this.suggestionOrSelection) {
                return this.auctionTransaction.marketDataRecords[this.suggestionOrSelection].marketUnitPrice;
            }
            return undefined;
        },
        marketDataArray(): [string, MarketData][] {
            const marketDataArraySorted = Object.entries(this.auctionTransaction.marketDataRecords || {});
            marketDataArraySorted.sort((a, b) => {
                // push NaNs to the end
                if (a[1].marketUnitPrice.isNaN() && b[1].marketUnitPrice.isNaN()) {
                    return 1;
                }
                if (a[1].marketUnitPrice.isNaN()) {
                    return 1;
                }
                if (b[1].marketUnitPrice.isNaN()) {
                    return -1;
                }
                return b[1].marketUnitPrice.minus(a[1].marketUnitPrice).toNumber();
            });
            return marketDataArraySorted;
        },
    },
    methods: {
        isMarketIdAutorouted(id: string): boolean {
            const exchange: any = COLLATERALS[this.auctionTransaction.collateralType].exchanges[id] || undefined;
            return exchange ? exchange.automaticRouter === true : false;
        },
        formatRouteFromPools(pools: Pool[] | undefined) {
            if (!pools || !pools?.length) {
                return '';
            }
            const route = pools.map(pool => pool.routes[0]);
            route.push(pools[pools.length - 1].routes[1]);
            return route.join(' → ');
        },
        getRouteFromMarketData(marketData: MarketData) {
            if (!marketData) {
                return undefined;
            }
            if (marketData.pools) {
                return this.formatRouteFromPools(marketData.pools);
            }
            if (marketData.oneInch?.path) {
                return marketData.oneInch.path.join(' → ');
            }
        },
    },
});
</script>

<style scoped>
.Title {
    @apply text-left text-green-500;
}
.Icon {
    @apply inline;
}
.Content {
    @apply pl-4;
}
.LoadingAutoRouter {
    @apply h-3 w-3 mt-1 mr-1 animate-spin fill-current;
}
</style>
