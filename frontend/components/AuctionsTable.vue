<template>
    <div class="AuctionsTable relative">
        <Table
            :data-source="auctions"
            :columns="columns"
            :pagination="{ pageSize: rowsPerPage, hideOnSinglePage: true }"
            :row-class-name="record => (record.id === selectedAuctionId ? 'selected-row' : '')"
            :row-key="record => record.id"
        >
            <div slot="amountRAW" slot-scope="amountRAW, record" class="CustomCell">
                {{ amountRAW }} {{ record.collateralType }}
            </div>
            <div slot="till" slot-scope="till" class="CustomCell"><time-till :date="till" /></div>
            <div slot="action" slot-scope="record" class="CustomCell">
                <nuxt-link
                    :to="`/?auction=${record.id}`"
                    class="flex w-full h-full bg-green-500 items-center justify-center text-white"
                >
                    Select
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
                    title: 'Collateral type',
                    dataIndex: 'collateralType',
                    sorter: compareBy('collateralType', (a: string, b: string) => a.localeCompare(b)),
                },
                {
                    title: 'Amount',
                    dataIndex: 'amountRAW',
                    scopedSlots: { customRender: 'amountRAW' },
                    sorter: compareBy('amountRAW'),
                },
                {
                    title: 'DAI',
                    dataIndex: 'amountDAI',
                    sorter: compareBy('amountDAI'),
                },
                {
                    title: 'Time till the end',
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
    @apply border-b-2 border-r-2 border-gray-600;
}
.AuctionsTable >>> .selected-row {
    @apply bg-gray-500;
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
