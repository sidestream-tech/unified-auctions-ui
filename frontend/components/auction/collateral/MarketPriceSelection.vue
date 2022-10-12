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
            <div v-show="isExpanded" class="Content">
                <div v-for="(value, key) in auctionTransaction.marketData" :key="key" class="flex justify-between">
                    <table>
                        <tr class="flex space-x-2">
                            <td>{{ key }}</td>
                            <td>
                                <span v-for="currency in value.route" :key="currency">{{ currency }} &#8594; </span>
                                DAI
                            </td>
                        </tr>
                    </table>
                    <div v-if="value.unitPrice && !value.unitPrice.isNaN()" class="flex space-x-2">
                        <button type="button" @click="$emit('update:marketId', key)">
                            <span v-if="marketId === key" class="opacity-50">Selected</span>
                            <span v-else class="text-green-500">Select</span>
                        </button>
                        <div>
                            <FormatCurrency :value="value.unitPrice" currency="DAI" /> per
                            <span class="uppercase">{{ auctionTransaction.collateralSymbol }}</span>
                        </div>
                    </div>
                    <div v-else class="opacity-50">Unknown</div>
                </div>
            </div>
        </CollapseTransition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Icon } from 'ant-design-vue';
import CollapseTransition from '@ivanv/vue-collapse-transition';
import { AuctionTransaction } from 'auctions-core/src/types';
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
        suggestionOrSelection(): string {
            return this.marketId ? this.marketId : this.auctionTransaction.suggestedMarketId;
        },
        marketUnitPrice(): BigNumber {
            return this.auctionTransaction.marketData[this.suggestionOrSelection].unitPrice;
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
