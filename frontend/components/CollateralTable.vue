<template>
    <Table
        :data-source="collaterals"
        :columns="columns"
        :row-key="record => record.ilk"
        class="CollateralTable"
        :locale="{ emptyText: 'No Collateral Types found.' }"
        :pagination="{ pageSize: collateralAmount, hideOnSinglePage: true }"
    >
        <div slot="ilk" slot-scope="ilk" class="Element">
            {{ ilk }}
        </div>
        <div slot="symbol" slot-scope="symbol" class="Element">{{ symbol }}</div>
        <div
            slot="marketUnitPrice"
            slot-scope="marketUnitPrice, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <FormatCurrency v-if="validBigNumber(marketUnitPrice)" :value="marketUnitPrice" currency="DAI" />
            <div v-else>
                <div v-if="isLoading(record)" class="flex items-center">
                    <LoadingIcon class="h-3 w-3 animate animate-spin fill-current dark:text-gray-300 mr-2" />
                    <span>Loading...</span>
                </div>
                <div v-else>
                    <span class="text-red-500">error</span>
                    <Popover
                        placement="top"
                        title="Error while fetching Uniswap Market Value"
                        :content="marketUnitPrice"
                        trigger="hover"
                    >
                        <span class="Error">...</span>
                    </Popover>
                </div>
            </div>
        </div>
        <div
            slot="secondsBetweenPriceDrops"
            slot-scope="secondsBetweenPriceDrops, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <span v-if="secondsBetweenPriceDrops && validBigNumber(secondsBetweenPriceDrops)"
                >{{ secondsBetweenPriceDrops }} sec.</span
            >
            <div v-if="secondsBetweenPriceDrops && !validBigNumber(secondsBetweenPriceDrops)">
                <span class="text-red-500">error</span>
                <Popover
                    placement="top"
                    title="Error while fetching Step and Cut"
                    :content="secondsBetweenPriceDrops"
                    trigger="hover"
                >
                    <span class="Error">...</span>
                </Popover>
            </div>
        </div>
        <div
            slot="priceDropRatio"
            slot-scope="priceDropRatio, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <span v-if="priceDropRatio && validBigNumber(priceDropRatio)">
                {{
                    priceDropRatio
                        .toNumber()
                        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }}
                %
            </span>
        </div>
        <div slot="icon" slot-scope="record" class="Element">
            <CurrencyIcon :currency-symbol="record.symbol" />
        </div>
    </Table>
</template>

<script lang="ts">
import type { CollateralRow } from 'auctions-core/src/types';
import Vue from 'vue';
import { Table, Popover } from 'ant-design-vue';
import CurrencyIcon from './common/CurrencyIcon.vue';
import FormatCurrency from './utils/FormatCurrency.vue';
import LoadingIcon from '~/assets/icons/loading.svg';

export default Vue.extend({
    components: {
        CurrencyIcon,
        FormatCurrency,
        Table,
        LoadingIcon,
        Popover,
    },
    props: {
        collaterals: {
            type: Array as Vue.PropType<CollateralRow[]>,
            default: () => [],
        },
    },
    computed: {
        collateralAmount() {
            return this.collaterals.length;
        },
        columns(): Object[] {
            return [
                {
                    title: 'Collateral Type',
                    dataIndex: 'ilk',
                    scopedSlots: { customRender: 'ilk' },
                },
                {
                    title: 'Currency',
                    dataIndex: 'symbol',
                    scopedSlots: { customRender: 'symbol' },
                },
                {
                    title: 'Uniswap Market Value',
                    dataIndex: 'marketUnitPrice',
                    scopedSlots: { customRender: 'marketUnitPrice' },
                },
                {
                    title: 'Step',
                    dataIndex: 'secondsBetweenPriceDrops',
                    scopedSlots: { customRender: 'secondsBetweenPriceDrops' },
                },
                {
                    title: 'Cut',
                    dataIndex: 'priceDropRatio',
                    scopedSlots: { customRender: 'priceDropRatio' },
                },
                {
                    title: 'Icon',
                    scopedSlots: { customRender: 'icon' },
                },
            ];
        },
    },
    methods: {
        isLoading(record: CollateralRow) {
            return (
                typeof record.secondsBetweenPriceDrop === 'undefined' &&
                typeof record.priceDropRatio === 'undefined' &&
                typeof record.marketUnitPrice === 'undefined'
            );
        },
        validBigNumber(bigNumber: Object | String) {
            return bigNumber instanceof Object;
        },
    },
});
</script>

<style scoped>
.Element {
    @apply flex items-center p-2 w-full h-full whitespace-nowrap;
}

.Loading {
    @apply bg-gray-200 dark:bg-gray-700 opacity-50;
}

.Error {
    padding: 0 0.2em 0.1em;
    @apply border rounded border-gray-300 bg-gray-100;
    @apply dark:border-gray-600 dark:bg-gray-800;
}

.CollateralTable >>> .ant-table-thead th {
    @apply p-2 h-8 bg-transparent text-gray-700 font-bold border-0 border-t-2 dark:text-gray-100;
}
.CollateralTable >>> .ant-table-tbody td {
    @apply p-0 h-8 text-gray-500 border-0 dark:text-gray-300;
}
.CollateralTable >>> .ant-table-tbody td,
.CollateralTable >>> .ant-table-thead th {
    @apply border-b-2 border-r-2 border-gray-300 dark:border-gray-600;
}

.CollateralTable >>> .ant-table-tbody td:first-child,
.CollateralTable >>> .ant-table-thead th:first-child {
    @apply border-l-2;
}
.CollateralTable >>> .ant-table-thead tr:hover th {
    @apply bg-transparent dark:bg-transparent;
}
.CollateralTable >>> .ant-table-tbody tr:hover td {
    @apply bg-transparent dark:bg-transparent;
}
</style>
