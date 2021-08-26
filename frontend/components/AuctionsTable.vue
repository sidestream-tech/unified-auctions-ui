<template>
    <div class="AuctionsTable relative">
        <Table
            :data-source="auctions"
            :columns="columns"
            :pagination="{ pageSize: rowsPerPage, hideOnSinglePage: true }"
            :row-class-name="record => (record.id === selectedAuctionId ? 'selected-row' : '')"
            :row-key="record => record.id"
        >
            <div slot="collateralType" slot-scope="collateralType" class="CustomCell">
                <format-currency :currency="collateralType" />
            </div>
            <div slot="amountRAW" slot-scope="amountRAW, record" class="CustomCell">
                <format-currency :value="amountRAW" :currency="record.collateralType" />
            </div>
            <div slot="amountPerCollateral" slot-scope="amountPerCollateral, record" class="CustomCell">
                <format-currency :value="amountPerCollateral" currency="DAI" />
                &nbsp;per&nbsp;
                <format-currency :currency="record.collateralType" />
            </div>
            <div slot="marketValue" slot-scope="marketValue" class="CustomCell">
                <format-market-value :value="marketValue" />
            </div>
            <div slot="till" slot-scope="till" class="CustomCell"><time-till :date="till" /></div>
            <div slot="action" slot-scope="record, index" class="CustomCell">
                <nuxt-link
                    :to="`/?auction=${record.id}`"
                    :class="hoveredRowIndex === index && 'bg-green-400'"
                    class="flex w-full h-full text-gray-500 items-center justify-center font-normal"
                >
                    See details
                </nuxt-link>
            </div>
        </Table>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
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
            type: Array,
            default: () => [],
        },
        selectedAuctionId: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            columns: [
                {
                    title: 'ID',
                    dataIndex: 'id',
                    sorter: compareBy('collateralType', (a: string, b: string) => a.localeCompare(b)),
                },
                {
                    title: 'Currency',
                    dataIndex: 'collateralType',
                    scopedSlots: { customRender: 'collateralType' },
                    sorter: compareBy('collateralType', (a: string, b: string) => a.localeCompare(b)),
                },
                {
                    title: 'Auction Amount',
                    dataIndex: 'amountRAW',
                    scopedSlots: { customRender: 'amountRAW' },
                    sorter: compareBy('amountRAW'),
                },
                {
                    title: 'Auction Price',
                    dataIndex: 'amountPerCollateral',
                    scopedSlots: { customRender: 'amountPerCollateral' },
                    sorter: compareBy('amountPerCollateral'),
                },
                {
                    title: 'Market Value*',
                    dataIndex: 'marketValue',
                    scopedSlots: { customRender: 'marketValue' },
                    sorter: compareBy('marketValue'),
                },
                {
                    title: 'Next price drop',
                    dataIndex: 'till',
                    scopedSlots: { customRender: 'till' },
                    sorter: compareBy('till', (a: Date, b: Date) => compareAsc(new Date(a), new Date(b))),
                },
                {
                    title: '',
                    scopedSlots: { customRender: 'action' },
                    width: '20%',
                },
            ],
            rowsPerPage: 7,
            hoveredRowIndex: null,
        };
    },
});
</script>

<style scoped>
.AuctionsTable >>> .ant-table-thead th {
    @apply py-1 px-2 h-8 bg-transparent text-gray-700 font-bold border-0 border-t-2;
}
.AuctionsTable >>> .ant-table-tbody td {
    @apply py-1 px-2 h-8 font-semibold text-gray-500 border-0;
}
.AuctionsTable >>> .ant-table-tbody tr > *:last-child {
    @apply p-0;
}
.AuctionsTable >>> .ant-table-tbody td,
.AuctionsTable >>> .ant-table-thead th {
    @apply border-b-2 border-r-2 border-gray-300;
}
.AuctionsTable >>> .selected-row {
    @apply bg-gray-200;
}
.AuctionsTable >>> .selected-row td {
    @apply text-gray-700;
}
.AuctionsTable >>> .ant-table-tbody td:first-child,
.AuctionsTable >>> .ant-table-thead th:first-child {
    @apply border-l-2;
}
.CustomCell {
    @apply w-full h-full flex items-center;
}
</style>
