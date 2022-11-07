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
                <FormatCurrency :value="marketUnitPrice" currency="DAI" /> per
                <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
            </div>
        </div>
        <CollapseTransition>
            <div v-show="isExpanded" class="Content overflow-x-auto">
                <table class="table-auto">
                    <tbody>
                        <tr v-for="callee in callees" :key="callee[0]">
                            <td class="pr-2 whitespace-nowrap">{{ callee[0] }}</td>
                            <td class="pr-2 whitespace-nowrap">
                                <span v-for="currency in callee[1].route" :key="currency"
                                    >{{ currency }} &#8594;
                                </span>
                                DAI
                            </td>
                            <td class="w-full text-right whitespace-nowrap">
                                <div v-if="callee[1].marketUnitPrice && !callee[1].marketUnitPrice.isNaN()">
                                    <button type="button" @click="$emit('update:marketId', callee[0])">
                                        <span v-if="suggestionOrSelection === callee[0]" class="opacity-50"
                                            >Selected</span
                                        >
                                        <span v-else class="text-green-500">Select</span>
                                    </button>
                                    <span class="pl-1">
                                        <FormatCurrency :value="callee[1].marketUnitPrice" currency="DAI" /> per
                                        <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
                                    </span>
                                </div>
                                <div v-else class="opacity-50">Unknown</div>
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
import { AuctionTransaction, MarketData } from 'auctions-core/src/types';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    components: {
        Icon,
        FormatCurrency,
        CollapseTransition,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        marketId: {
            type: String,
            default: '',
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
        callees(): [string, MarketData][] {
            const marketDataRecordsSorted = Object.entries(this.auctionTransaction.marketDataRecords || {});
            marketDataRecordsSorted.sort((a, b) => {
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
                return a[1].marketUnitPrice.minus(b[1].marketUnitPrice).multipliedBy(-1).toNumber();
            });
            return marketDataRecordsSorted;
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
</style>
