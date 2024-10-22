<template>
    <Loading :is-loading="showLoadingOverlay" :error="error">
        <Table
            ref="tableContainer"
            :data-source="auctions"
            :columns="columns"
            :pagination="{ pageSize: numberOfRowsPerPage, hideOnSinglePage: true }"
            :row-class-name="getRowClassNames"
            :row-key="record => record.id"
            :custom-row="customRowEvents"
            :get-popup-container="() => $el"
            :locale="{ emptyText: 'No active auctions' }"
            table-layout="auto"
            :scroll="{ x: 'max-content' }"
            class="AuctionsTable relative overflow-visible"
        >
            <div slot="collateralAmount" slot-scope="collateralAmount, record" class="flex items-center space-x-2">
                <currency-icon :currency-symbol="record.tokenName" />
                <format-currency :value="collateralAmount" :currency="record.tokenName" />
            </div>
            <div slot="approximateUnitPrice" slot-scope="approximateUnitPrice, record">
                <template v-if="record.isActive && !record.isFinished">
                    <format-currency :value="approximateUnitPrice" currency="DAI" /> per
                    <format-currency :currency="record.tokenName" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="marketUnitPriceToUnitPriceRatio" slot-scope="marketUnitPriceToUnitPriceRatio, record">
                <format-market-value
                    v-if="record.isActive && record.marketUnitPriceToUnitPriceRatio && !record.isFinished"
                    :value="marketUnitPriceToUnitPriceRatio"
                />
                <span
                    v-else-if="record.isActive && !record.marketUnitPriceToUnitPriceRatio && !record.isFinished"
                    class="opacity-50"
                >
                    Not tradable
                </span>
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="endDate" slot-scope="endDate, record">
                <span v-if="record.isFinished" class="opacity-50"> Finished </span>
                <span v-else-if="record.isRestarting" class="opacity-50"> Restarting </span>
                <span v-else-if="!record.isActive" class="opacity-50"> Requires Restart </span>
                <span v-else>
                    Ends in
                    <TimeTill :date="endDate" />
                </span>
            </div>
            <div slot="updatingStatus" class="opacity-50 font-normal">
                <div v-if="isLoading" class="flex items-center space-x-2">
                    <LoadingIcon class="h-4 w-4 animate animate-spin fill-current dark:text-gray-300" />
                    <span>Updating...</span>
                </div>
                <span v-else-if="lastUpdated">Updated <TimeTill :date="lastUpdated" /></span>
                <span v-else>Updated <span class="opacity-50">unknown time</span> ago</span>
            </div>
            <div slot="action" slot-scope="text, record, index" class="w-full h-full">
                <nuxt-link
                    :to="getAuctionLink(record)"
                    :class="
                        (hoveredRowIndex === index && 'bg-primary text-white dark:bg-primary-dark') || 'text-primary'
                    "
                    class="flex items-center justify-center w-full h-full hover:text-white p-2 whitespace-nowrap"
                >
                    <span v-if="record.isFinished">See details</span>
                    <span v-else-if="record.isActive">Participate</span>
                    <span v-else-if="!record.isActive">Restart Auction</span>
                </nuxt-link>
            </div>
        </Table>
    </Loading>
</template>

<script lang="ts">
import type { Auction } from 'auctions-core/src/types';
import Vue, { PropType } from 'vue';
import { Table } from 'ant-design-vue';
import { compareAsc } from 'date-fns';
import Loading from '~/components/common/other/Loading.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatMarketValue from '~/components/common/formatters/FormatMarketValue.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import CurrencyIcon from '~/components/common/other/CurrencyIcon.vue';
import LoadingIcon from '~/assets/icons/loading.svg';

const compareBy = function (field: string, cmp: Function = (a: number, b: number): number => a - b): Function {
    return (aAuction: any, bAuction: any, sortOrder: string) => {
        const greaterVal = sortOrder === 'ascend' ? 1 : -1;
        const aVal = aAuction[field];
        const bVal = bAuction[field];
        if (aAuction.isFinished) {
            return greaterVal;
        }
        if (!bAuction.isActive || bAuction.isFinished) {
            return -greaterVal;
        }
        if (typeof aVal === 'undefined') {
            return greaterVal;
        }
        if (typeof bVal === 'undefined') {
            return -greaterVal;
        }
        return cmp(aVal, bVal);
    };
};

export default Vue.extend({
    components: {
        Loading,
        Table,
        TimeTill,
        FormatMarketValue,
        FormatCurrency,
        CurrencyIcon,
        LoadingIcon,
    },
    props: {
        auctions: {
            type: Array as PropType<Auction[]>,
            default: () => [],
        },
        selectedAuctionId: {
            type: String,
            default: null,
        },
        showMoreRows: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        lastUpdated: {
            type: Date,
            default: null,
        },
        error: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            hoveredRowIndex: 0,
        };
    },
    computed: {
        columns(): Object[] {
            const currencies = this.auctions.map(auction => auction.collateralSymbol);
            const uniqueCurrencies = Array.from(new Set(currencies));
            const currenciesFilters = uniqueCurrencies.map(currency => ({
                text: currency.toUpperCase(),
                value: currency,
            }));
            return [
                {
                    title: 'Index',
                    dataIndex: 'index',
                    sorter: compareBy('index'),
                },
                {
                    title: 'Auction Amount',
                    dataIndex: 'collateralAmount',
                    scopedSlots: { customRender: 'collateralAmount' },
                    sorter: compareBy('collateralAmount'),
                    filters: currenciesFilters,
                    onFilter: (selectedCurrency: string, auction: Auction) => {
                        return auction.collateralSymbol.includes(selectedCurrency);
                    },
                },
                {
                    title: 'Auction Price',
                    dataIndex: 'approximateUnitPrice',
                    scopedSlots: { customRender: 'approximateUnitPrice' },
                    sorter: compareBy('approximateUnitPrice'),
                },
                {
                    title: 'Market Difference',
                    dataIndex: 'marketUnitPriceToUnitPriceRatio',
                    scopedSlots: { customRender: 'marketUnitPriceToUnitPriceRatio' },
                    sorter: compareBy('marketUnitPriceToUnitPriceRatio'),
                    defaultSortOrder: 'ascend',
                },
                {
                    title: 'State',
                    dataIndex: 'endDate',
                    scopedSlots: { customRender: 'endDate' },
                    sorter: compareBy('endDate', (a: Date, b: Date) => compareAsc(a, b)),
                },
                {
                    slots: { title: 'updatingStatus', customRender: 'action' },
                    scopedSlots: { customRender: 'action' },
                },
            ];
        },
        numberOfRowsPerPage(): number {
            return this.showMoreRows ? 15 : 10;
        },
        showLoadingOverlay(): boolean {
            return this.isLoading && this.auctions.length === 0;
        },
    },
    methods: {
        customRowEvents(record: Auction, rowIndex: number): Object {
            return {
                on: {
                    click: () => {
                        this.$router?.push(this.getAuctionLink(record));
                    },
                    mouseenter: () => {
                        this.hoveredRowIndex = rowIndex;
                    },
                },
            };
        },
        getRowClassNames(auction: Auction) {
            const classes = [];
            if (auction.id === this.selectedAuctionId) {
                classes.push('selected-row');
            }
            if (!auction.isActive || auction.transactionAddress || auction.isFinished) {
                classes.push('bg-gray-100 dark:bg-gray-800');
            }
            return classes.join(' ');
        },
        getAuctionLink(auction: Auction) {
            const searchParams = new URLSearchParams({ network: auction.network, auction: auction.id });
            return `/collateral?${searchParams.toString()}`;
        },
    },
});
</script>

<style scoped>
.AuctionsTable >>> .ant-table-placeholder {
    min-height: 100px;
}
.AuctionsTable >>> .ant-table-thead th {
    @apply py-1 px-2 h-8 bg-transparent text-gray-700 font-bold border-0 border-t-2 dark:text-gray-100;
}
.AuctionsTable >>> .ant-table-tbody td {
    @apply py-1 px-2 h-8 text-gray-500 border-0 dark:text-gray-300;
}
.AuctionsTable >>> .ant-table-tbody tr > *:last-child {
    @apply p-0;
}
.AuctionsTable >>> .ant-table-tbody td,
.AuctionsTable >>> .ant-table-thead th {
    @apply border-b-2 border-r-2 border-gray-300 dark:border-gray-600;
}
.AuctionsTable >>> .selected-row {
    @apply bg-gray-200 dark:bg-dark-light;
}
.AuctionsTable >>> .selected-row td {
    @apply text-gray-700;
}
.AuctionsTable >>> .ant-table-tbody td:first-child,
.AuctionsTable >>> .ant-table-thead th:first-child {
    @apply border-l-2;
}
.AuctionsTable >>> .ant-table-thead tr:hover th {
    @apply dark:bg-dark-light;
}
.AuctionsTable >>> .ant-table-tbody tr:hover td {
    @apply dark:bg-dark-light;
}
.AuctionsTable >>> .ant-dropdown-menu-item {
    @apply mb-1;
}
</style>
