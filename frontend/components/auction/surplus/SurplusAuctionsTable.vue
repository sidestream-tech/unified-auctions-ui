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
            :table-layout="auto"
            :scroll="{ x: 'max-content' }"
            class="AuctionsTable relative overflow-visible"
        >
            <div slot="auctionAmount" slot-scope="receiveAmountDAI">
                <format-currency v-if="receiveAmountDAI" :value="receiveAmountDAI" currency="DAI" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="bidAmountMKR" slot-scope="bidAmountMKR">
                <template v-if="bidAmountMKR && !bidAmountMKR.isEqualTo(0)">
                    <format-currency :value="bidAmountMKR" currency="MKR" />
                </template>
                <span v-else class="opacity-50">No bids yet</span>
            </div>
            <div slot="unitPrice" slot-scope="unitPrice">
                <template v-if="unitPrice && !unitPrice.isEqualTo(0)">
                    <format-currency :value="unitPrice" currency="MKR" /> per <format-currency currency="DAI" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="marketUnitPriceToUnitPriceRatio" slot-scope="marketUnitPriceToUnitPriceRatio, record">
                <template
                    v-if="
                        getIsAuctionActive(record) &&
                        marketUnitPriceToUnitPriceRatio &&
                        !marketUnitPriceToUnitPriceRatio.isNaN()
                    "
                >
                    <format-market-value :value="marketUnitPriceToUnitPriceRatio" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="state" slot-scope="state, record">
                <SurplusAuctionState :state="state" :end-date="record.earliestEndDate" />
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
                    <span v-if="record.state === 'collected'"> See details </span>
                    <span v-else-if="record.state === 'requires-restart'"> Restart </span>
                    <span v-else-if="record.state === 'ready-for-collection'"> Collect DAI </span>
                    <span v-else> Participate </span>
                </nuxt-link>
            </div>
        </Table>
    </Loading>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Table } from 'ant-design-vue';
import { compareAsc } from 'date-fns';
import { SurplusAuctionTransaction } from 'auctions-core/src/types';
import LoadingIcon from '~/assets/icons/loading.svg';
import SurplusAuctionState from '~/components/auction/surplus/SurplusAuctionState.vue';
import Loading from '~/components/common/other/Loading.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatMarketValue from '~/components/common/formatters/FormatMarketValue.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

const compareBy = function (field: string, cmp: Function = (a: number, b: number): number => a - b): Function {
    return (aAuction: any, bAuction: any, sortOrder: string) => {
        const greaterVal = sortOrder === 'ascend' ? 1 : -1;
        const aVal = aAuction[field];
        const bVal = bAuction[field];

        if (aAuction.state === 'collected') {
            return greaterVal;
        }
        if (bAuction.state === 'collected') {
            return -greaterVal;
        }
        if (aAuction.state === 'requires-restart') {
            return greaterVal;
        }
        if (bAuction.state === 'requires-restart') {
            return -greaterVal;
        }
        if (aAuction.state === 'ready-for-collection') {
            return greaterVal;
        }
        if (bAuction.state === 'ready-for-collection') {
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

const STATES_FILTERS: { text: string; value: string }[] = [
    {
        text: 'No bids yet',
        value: 'just-started',
    },
    {
        text: 'With bids',
        value: 'have-bids',
    },
    {
        text: 'Ready for collection',
        value: 'ready-for-collection',
    },
    {
        text: 'Requires restart',
        value: 'requires-restart',
    },
    {
        text: 'Collected',
        value: 'collected',
    },
];

export default Vue.extend({
    name: 'SurplusAuctionsTable',
    components: {
        SurplusAuctionState,
        Loading,
        Table,
        TimeTill,
        FormatMarketValue,
        FormatCurrency,
        LoadingIcon,
    },
    props: {
        auctions: {
            type: Array as PropType<SurplusAuctionTransaction[]>,
            default: () => [],
        },
        selectedAuctionId: {
            type: Number,
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
            const states = this.auctions.map(auction => auction.state);
            const uniqueStates = Array.from(new Set(states));
            const statesFilters = STATES_FILTERS.filter(state => {
                return !!uniqueStates.includes(state.value);
            });
            return [
                {
                    title: 'Index',
                    dataIndex: 'id',
                    sorter: compareBy('id'),
                },
                {
                    title: 'Auction Amount',
                    dataIndex: 'receiveAmountDAI',
                    scopedSlots: { customRender: 'auctionAmount' },
                    sorter: compareBy('receiveAmountDAI'),
                },
                {
                    title: 'Highest Bid',
                    dataIndex: 'bidAmountMKR',
                    scopedSlots: { customRender: 'bidAmountMKR' },
                    sorter: compareBy('bidAmountMKR'),
                },
                {
                    title: 'Auction Price',
                    dataIndex: 'unitPrice',
                    scopedSlots: { customRender: 'unitPrice' },
                    sorter: compareBy('unitPrice'),
                },
                {
                    title: 'Market Difference',
                    dataIndex: 'marketUnitPriceToUnitPriceRatio',
                    scopedSlots: { customRender: 'marketUnitPriceToUnitPriceRatio' },
                    sorter: compareBy('marketUnitPriceToUnitPriceRatio'),
                },
                {
                    title: 'State',
                    dataIndex: 'state',
                    scopedSlots: { customRender: 'state' },
                    filters: statesFilters,
                    onFilter: (selectedState: string, auction: SurplusAuctionTransaction) => {
                        return auction.state.includes(selectedState);
                    },
                    sorter: compareBy('earliestEndDate', (a: Date, b: Date) => compareAsc(a, b)),
                    defaultSortOrder: 'ascend',
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
        customRowEvents(record: SurplusAuctionTransaction, rowIndex: number): Object {
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
        getRowClassNames(auction: SurplusAuctionTransaction) {
            const classes = [];
            if (this.selectedAuctionId === auction.id) {
                classes.push('selected-row');
            }
            if (!this.getIsAuctionActive(auction)) {
                classes.push('bg-gray-100 dark:bg-gray-800');
            }
            return classes.join(' ');
        },
        getAuctionLink(auction: SurplusAuctionTransaction) {
            const searchParams = new URLSearchParams({ network: auction.network, auction: auction.id.toString() });
            return `/surplus?${searchParams.toString()}`;
        },
        getIsAuctionFinished(auction: SurplusAuctionTransaction) {
            return auction.state !== 'ready-for-collection' && auction.state !== 'collected';
        },
        getIsAuctionActive(auction: SurplusAuctionTransaction) {
            return auction.state !== 'requires-restart' && this.getIsAuctionFinished(auction);
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
