<template>
    <Loading :is-loading="showLoadingOverlay" :error="error">
        <Table
            ref="tableContainer"
            :data-source="vaultTransactions"
            :columns="columns"
            :pagination="{ pageSize: numberOfRowsPerPage, hideOnSinglePage: true }"
            :row-class-name="getRowClassNames"
            :row-key="record => record.id"
            :custom-row="customRowEvents"
            :get-popup-container="() => $el"
            :locale="{ emptyText: 'There are currently no vaults at risk.' }"
            class="VaultsTable relative overflow-visible"
        >
            <div slot="collateralAmount" slot-scope="collateralAmount, record">
                <format-currency v-if="collateralAmount" :value="collateralAmount" :currency="record.collateralType" />
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="proximityToLiquidation" slot-scope="proximityToLiquidation">
                <template v-if="proximityToLiquidation"> {{ proximityToLiquidation }}% </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="unitPrice" slot-scope="grossProfitDai">
                <template v-if="grossProfitDai">
                    <format-currency :value="grossProfitDai" currency="DAI" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="nextPriceChange" slot-scope="nextPriceChange">
                <template v-if="nextPriceChange">
                    <TimeTill :date="nextPriceChange" />
                </template>
                <span v-else class="opacity-50">Unknown</span>
            </div>
            <div slot="updatingStatus" class="opacity-50 font-normal">
                <div v-if="isLoading" class="flex items-center space-x-2">
                    <LoadingIcon class="h-4 w-4 animate animate-spin fill-current dark:text-gray-300" />
                    <span>Updating...</span>
                </div>
                <span v-else-if="lastUpdated"> Last updated <TimeTill :date="lastUpdated" /></span>
                <span v-else> Last updated unknown time ago </span>
            </div>
            <div slot="action" slot-scope="text, record, index" class="w-full h-full">
                <nuxt-link
                    :to="getVaultLink(record)"
                    :class="
                        (hoveredRowIndex === index && 'bg-primary text-white dark:bg-primary-dark') || 'text-primary'
                    "
                    class="flex items-center justify-center w-full h-full hover:text-white p-2 whitespace-nowrap"
                >
                    <span v-if="record.state === 'collected'"> See details </span>
                    <span v-else-if="record.state === 'requires-restart'"> Restart </span>
                    <span v-else-if="record.state === 'ready-for-collection'"> Collect MKR </span>
                    <span v-else> Participate </span>
                </nuxt-link>
            </div>
        </Table>
    </Loading>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Table } from 'ant-design-vue';
import { Auction, VaultTransaction } from 'auctions-core/src/types';
import { compareAsc } from 'date-fns';
import Loading from '~/components/common/other/Loading.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import LoadingIcon from '~/assets/icons/loading.svg';

const compareBy = function (field: string, cmp: Function = (a: number, b: number): number => a - b): Function {
    return (aVault: any, bVault: any, sortOrder: string) => {
        const greaterVal = sortOrder === 'ascend' ? 1 : -1;
        const aVal = aVault[field];
        const bVal = bVault[field];
        if (aVault.state === 'liquidated') {
            return greaterVal;
        }
        if (bVault.isActive === 'liquidated') {
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
    name: 'VaultsTable',
    components: {
        Loading,
        Table,
        TimeTill,
        FormatCurrency,
        LoadingIcon,
    },
    props: {
        vaultTransactions: {
            type: Array as PropType<VaultTransaction[]>,
            default: () => [],
        },
        selectedVaultId: {
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
            const currencies = this.vaultTransactions.map(vault => vault.collateralType);
            const uniqueCurrencies = Array.from(new Set(currencies));
            const currenciesFilters = uniqueCurrencies.map(currency => ({
                text: currency,
                value: currency,
            }));
            return [
                {
                    title: 'Index',
                    dataIndex: 'id',
                    sorter: compareBy('id'),
                },
                {
                    title: 'Collateral amount',
                    dataIndex: 'collateralAmount',
                    scopedSlots: { customRender: 'collateralAmount' },
                    sorter: compareBy('collateralAmount'),
                    filters: currenciesFilters,
                    onFilter: (selectedCurrency: string, auction: Auction) => {
                        return auction.collateralSymbol.includes(selectedCurrency);
                    },
                },
                {
                    title: 'Proximity to liquidation threshold',
                    dataIndex: 'proximityToLiquidation',
                    scopedSlots: { customRender: 'proximityToLiquidation' },
                    sorter: compareBy('proximityToLiquidation'),
                },
                {
                    title: 'Potential profit',
                    dataIndex: 'grossProfitDai',
                    scopedSlots: { customRender: 'grossProfitDai' },
                    sorter: compareBy('grossProfitDai'),
                },
                {
                    title: 'Next price update',
                    dataIndex: 'nextPriceChange',
                    scopedSlots: { customRender: 'nextPriceChange' },
                    sorter: compareBy('nextPriceChange', (a: Date, b: Date) => compareAsc(a, b)),
                },
                {
                    slots: { title: 'updatingStatus', customRender: 'action' },
                    scopedSlots: { customRender: 'action' },
                    width: '20%',
                },
            ];
        },
        numberOfRowsPerPage(): number {
            return this.showMoreRows ? 15 : 10;
        },
        showLoadingOverlay(): boolean {
            return this.isLoading && this.vaultTransactions.length === 0;
        },
    },
    methods: {
        customRowEvents(record: VaultTransaction, rowIndex: number): Object {
            return {
                on: {
                    click: () => {
                        this.$router?.push(this.getVaultLink(record));
                    },
                    mouseenter: () => {
                        this.hoveredRowIndex = rowIndex;
                    },
                },
            };
        },
        getRowClassNames(vault: VaultTransaction) {
            const classes = [];
            if (this.selectedVaultId === vault.id) {
                classes.push('selected-row');
            }
            if (!this.getIsVaultFinished(vault)) {
                classes.push('bg-gray-100 dark:bg-gray-800');
            }
            return classes.join(' ');
        },
        getVaultLink(vault: VaultTransaction) {
            const searchParams = new URLSearchParams({
                network: vault.network,
                vault: `${vault.collateralType}:${vault.id}`,
            });
            return `/vaults?${searchParams.toString()}`;
        },
        getIsVaultFinished(auction: VaultTransaction) {
            return auction.state !== 'liquidated';
        },
    },
});
</script>

<style scoped>
.VaultsTable >>> .ant-table-placeholder {
    min-height: 100px;
}
.VaultsTable >>> .ant-table-thead th {
    @apply py-1 px-2 h-8 bg-transparent text-gray-700 font-bold border-0 border-t-2 dark:text-gray-100;
}
.VaultsTable >>> .ant-table-tbody td {
    @apply py-1 px-2 h-8 text-gray-500 border-0 dark:text-gray-300;
}
.VaultsTable >>> .ant-table-tbody tr > *:last-child {
    @apply p-0;
}
.VaultsTable >>> .ant-table-tbody td,
.VaultsTable >>> .ant-table-thead th {
    @apply border-b-2 border-r-2 border-gray-300 dark:border-gray-600;
}
.VaultsTable >>> .selected-row {
    @apply bg-gray-200 dark:bg-dark-light;
}
.VaultsTable >>> .selected-row td {
    @apply text-gray-700;
}
.VaultsTable >>> .ant-table-tbody td:first-child,
.VaultsTable >>> .ant-table-thead th:first-child {
    @apply border-l-2;
}
.VaultsTable >>> .ant-table-thead tr:hover th {
    @apply dark:bg-dark-light;
}
.VaultsTable >>> .ant-table-tbody tr:hover td {
    @apply dark:bg-dark-light;
}
.VaultsTable >>> .ant-dropdown-menu-item {
    @apply mb-1;
}
</style>
