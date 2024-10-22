<template>
    <Table
        :data-source="collaterals"
        :columns="columns"
        :row-key="record => record.ilk"
        class="CollateralTable"
        :locale="{ emptyText: 'No Collateral Types found.' }"
        :pagination="{ pageSize: collateralAmount, hideOnSinglePage: true }"
    >
        <div slot="icon" slot-scope="record" class="Element">
            <CurrencyIcon :currency-symbol="record.tokenName" />
        </div>
        <div slot="ilk" slot-scope="ilk" class="Element">
            {{ ilk }}
        </div>
        <div slot="symbol" slot-scope="tokenName" class="Element">{{ tokenName }}</div>
        <div slot="token" slot-scope="tokenAddress, record" class="Element" :class="{ Loading: isLoading(record) }">
            <div v-if="isLoading(record)" class="flex items-center">
                <LoadingIcon class="h-3 w-3 animate animate-spin fill-current dark:text-gray-300 mr-2" />
                <span>Loading...</span>
            </div>
            <div v-else>
                <format-address v-if="tokenAddress" :value="tokenAddress" shorten type="address" />
                <Popover v-else placement="top" :content="record.tokenAddressError" trigger="hover">
                    <p class="inline-block w-20 text-red-500 truncate">
                        <span>{{ record.tokenAddressError }}</span>
                    </p>
                </Popover>
            </div>
        </div>
        <div
            slot="marketUnitPrice"
            slot-scope="marketUnitPrice, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <FormatCurrency v-if="isValidBigNumber(marketUnitPrice)" :value="marketUnitPrice" currency="DAI" />
            <div v-else>
                <Popover placement="topLeft" :content="marketUnitPrice" trigger="hover">
                    <p class="inline-block w-48 text-red-500 truncate">
                        <span>{{ marketUnitPrice }}</span>
                    </p>
                </Popover>
            </div>
        </div>
        <div
            slot="autoRouteQuote"
            slot-scope="autoRouteQuote, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <FormatCurrency v-if="!record.autoRouteError && autoRouteQuote" :value="autoRouteQuote" currency="DAI" />
            <div v-else-if="record.autoRouteError">
                <Popover placement="topLeft" :content="record.autoRouteError" trigger="hover">
                    <p class="inline-block w-48 text-red-500 truncate">
                        <span>{{ record.autoRouteError }}</span>
                    </p>
                </Popover>
            </div>
        </div>
        <div
            slot="autoRouteExchanges"
            slot-scope="autoRouteExchanges, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <div v-if="autoRouteExchanges">
                {{ autoRouteExchanges.join(', ') }}
            </div>
        </div>
        <div
            slot="secondsBetweenPriceDrops"
            slot-scope="secondsBetweenPriceDrops, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <span v-if="secondsBetweenPriceDrops && isValidBigNumber(secondsBetweenPriceDrops)"
                >{{ secondsBetweenPriceDrops }} sec.</span
            >
            <Popover
                v-if="secondsBetweenPriceDrops && !isValidBigNumber(secondsBetweenPriceDrops)"
                placement="top"
                :content="secondsBetweenPriceDrops"
                trigger="hover"
            >
                <p class="inline-block w-20 text-red-500 truncate">
                    <span>{{ secondsBetweenPriceDrops }}</span>
                </p>
            </Popover>
        </div>
        <div
            slot="priceDropRatio"
            slot-scope="priceDropRatio, record"
            class="Element"
            :class="{ Loading: isLoading(record) }"
        >
            <span v-if="priceDropRatio && isValidBigNumber(priceDropRatio)">
                {{ priceDropRatio.multipliedBy(100).toFixed(2) }}
                %
            </span>
        </div>
    </Table>
</template>

<script lang="ts">
import type { CollateralRow } from 'auctions-core/src/types';
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Table, Popover } from 'ant-design-vue';
import CurrencyIcon from '~/components/common/other/CurrencyIcon.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import LoadingIcon from '~/assets/icons/loading.svg';

export default Vue.extend({
    components: {
        CurrencyIcon,
        FormatCurrency,
        Table,
        LoadingIcon,
        Popover,
        FormatAddress,
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
                    title: 'Icon',
                    scopedSlots: { customRender: 'icon' },
                },
                {
                    title: 'Collateral Type',
                    dataIndex: 'ilk',
                    scopedSlots: { customRender: 'ilk' },
                },
                {
                    title: 'Currency',
                    dataIndex: 'tokenName',
                    scopedSlots: { customRender: 'symbol' },
                },
                {
                    title: 'Token',
                    dataIndex: 'tokenAddress',
                    scopedSlots: { customRender: 'token' },
                },
                {
                    title: 'Uniswap Market Value',
                    dataIndex: 'marketUnitPrice',
                    scopedSlots: { customRender: 'marketUnitPrice' },
                },
                {
                    title: 'UniV3 Auto Route Quote',
                    dataIndex: 'autoRouteQuote',
                    scopedSlots: { customRender: 'autoRouteQuote' },
                },
                {
                    title: 'UniV3 Auto Route Exchanges',
                    dataIndex: 'autoRouteExchanges',
                    scopedSlots: { customRender: 'autoRouteExchanges' },
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
            ];
        },
    },
    methods: {
        isLoading(record: CollateralRow) {
            return (
                typeof record.secondsBetweenPriceDrops === 'undefined' &&
                typeof record.priceDropRatio === 'undefined' &&
                typeof record.marketUnitPrice === 'undefined'
            );
        },
        isValidBigNumber(bigNumber: BigNumber) {
            return BigNumber.isBigNumber(bigNumber);
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

.CollateralTable >>> .ant-table-thead th {
    @apply p-2 h-8 bg-transparent text-gray-700 font-bold border-0 border-t-2 dark:text-gray-100;
}
.CollateralTable >>> .ant-table-tbody td {
    @apply p-0 h-8 text-gray-500 border-0 dark:text-gray-300;
}
.CollateralTable >>> .ant-table-tbody td,
.CollateralTable >>> .ant-table-thead th {
    @apply border-r-2 border-gray-300 dark:border-gray-600;
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
