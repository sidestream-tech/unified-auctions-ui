<template>
    <div class="AuctionsTable relative">
        <Table
            :data-source="auctions"
            :columns="columns"
            :pagination="{ pageSize: rowsPerPage, hideOnSinglePage: true }"
            :row-class-name="getRowClassNames"
            :row-key="record => record.id"
            :custom-row="customRowEvents"
            :get-popup-container="() => $el"
        >
            <div slot="amountRAW" slot-scope="amountRAW, record">
                <format-currency :value="amountRAW" :currency="record.collateralSymbol" />
            </div>
            <div slot="amountPerCollateral" slot-scope="amountPerCollateral, record">
                <format-currency :value="amountPerCollateral" currency="DAI" /> per
                <format-currency :currency="record.collateralSymbol" />
            </div>
            <div slot="marketValue" slot-scope="marketValue">
                <format-market-value :value="marketValue" />
            </div>
            <div slot="till" slot-scope="till, record" class="text-center">
                <span v-if="record.transactionAddress">Finished</span>
                <span v-else-if="!record.isActive">Inactive</span>
                <time-till v-else :date="till" />
            </div>
            <div slot="action" slot-scope="text, record, index" class="w-full h-full">
                <nuxt-link
                    :to="getAuctionLink(record)"
                    :class="
                        (hoveredRowIndex === index && 'bg-primary text-white dark:bg-primary-dark') || 'text-primary'
                    "
                    class="flex items-center justify-center w-full h-full hover:text-white p-2 whitespace-nowrap"
                >
                    See details
                </nuxt-link>
            </div>
        </Table>
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Table } from 'ant-design-vue';
import { compareAsc } from 'date-fns';
import TimeTill from '~/components/common/TimeTill.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

const compareBy = function (field: string, cmp: Function = (a: number, b: number): number => a - b): Function {
    return (firstElement: Indexable, secondElement: Indexable, sortOrder: string) => {
        const greaterVal = sortOrder === 'ascend' ? 1 : -1;
        const aVal = firstElement[field];
        const bVal = secondElement[field];
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
        Table,
        TimeTill,
        FormatMarketValue,
        FormatCurrency,
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
    },
    data() {
        return {
            rowsPerPage: 7,
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
                    title: 'ID',
                    dataIndex: 'auctionId',
                    sorter: compareBy('auctionId'),
                },
                {
                    title: 'Auction Amount',
                    dataIndex: 'amountRAW',
                    scopedSlots: { customRender: 'amountRAW' },
                    sorter: compareBy('amountRAW'),
                    filters: currenciesFilters,
                    onFilter: (selectedCurrency: string, auction: Auction) => {
                        return auction.collateralSymbol.includes(selectedCurrency);
                    },
                },
                {
                    title: 'Auction Price',
                    dataIndex: 'amountPerCollateral',
                    scopedSlots: { customRender: 'amountPerCollateral' },
                    sorter: compareBy('amountPerCollateral'),
                },
                {
                    title: 'Market Difference',
                    dataIndex: 'marketValue',
                    scopedSlots: { customRender: 'marketValue' },
                    sorter: compareBy('marketValue'),
                    defaultSortOrder: 'descend',
                },
                {
                    title: 'Next Price Drop',
                    dataIndex: 'till',
                    scopedSlots: { customRender: 'till' },
                    sorter: compareBy('till', (a: Date, b: Date) => compareAsc(new Date(a), new Date(b))),
                },
                {
                    title: '',
                    scopedSlots: { customRender: 'action' },
                    width: '20%',
                },
            ];
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
            if (!auction.isActive || auction.transactionAddress) {
                classes.push('bg-gray-100 dark:bg-gray-800');
            }
            return classes.join(' ');
        },
        getAuctionLink(auction: Auction) {
            return `/?auction=${auction.id}`;
        },
    },
});
</script>

<style scoped>
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
</style>
