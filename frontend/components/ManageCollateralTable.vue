<template>
    <div>
        <TextBlock v-if="isExplanationsShown" class="mb-2">
            This is a list of collaterals supported by the Maker. Each row provides the possibility to withdraw
            collateral from the VAT (if there is any) and to pre-authorize VAT transactions.
        </TextBlock>
        <table class="Table">
            <tr class="Heading">
                <th>Collateral</th>
                <th>Token</th>
                <th>Authorization</th>
                <th>Balance</th>
            </tr>
            <tbody>
                <tr v-for="collateralStatus of sortedCollaterals" :key="collateralStatus.type" class="Body">
                    <td>
                        <div class="flex items-center gap-2">
                            <CurrencyIcon :currency-symbol="collateralStatus.symbol" />
                            {{ collateralStatus.type }}
                        </div>
                    </td>
                    <td>
                        <format-address
                            v-if="collateralStatus.address"
                            :value="collateralStatus.address"
                            shorten
                            type="address"
                        />
                        <span v-else class="opacity-50">Unknown</span>
                    </td>
                    <td>
                        <span v-if="collateralStatus.isAuthorized">Authorized</span>
                        <div v-else class="flex items-center">
                            <span v-if="isAuthorizing">
                                <loading-icon class="h-3 w-3 fill-current text-gray-400 animate-spin mr-2 my-auto" />
                            </span>
                            <button
                                class="Button"
                                :disabled="isAuthorizing"
                                @click="$emit('authorizeCollateral', collateralStatus.type)"
                            >
                                Authorize
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="flex items-center mr-1">
                            <span v-if="isWithdrawing && canWithdrawCollateral(collateralStatus)">
                                <loading-icon class="h-3 w-3 fill-current text-gray-400 animate-spin mr-2 my-auto" />
                            </span>
                            <button
                                :disabled="!canWithdrawCollateral(collateralStatus) || isWithdrawing"
                                class="Button"
                                @click="$emit('withdrawCollateral', collateralStatus.type)"
                            >
                                Withdraw
                            </button>
                        </div>
                        <format-currency :value="collateralStatus.balance" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import CurrencyIcon from '~/components/common/CurrencyIcon.vue';
import LoadingIcon from '~/assets/icons/loading.svg';

export default Vue.extend({
    components: {
        TextBlock,
        FormatAddress,
        FormatCurrency,
        CurrencyIcon,
        LoadingIcon,
    },
    props: {
        collateralStatuses: {
            type: Array as Vue.PropType<CollateralStatus[]>,
            default: undefined,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isWithdrawing: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        sortedCollaterals() {
            const statuses = this.collateralStatuses;
            return statuses.sort((firstCollateral: CollateralStatus, secondCollateral: CollateralStatus) =>
                firstCollateral.type.localeCompare(secondCollateral.type)
            );
        },
    },
    methods: {
        close() {
            this.$emit('close');
        },
        canWithdrawCollateral(collateral: CollateralStatus) {
            return collateral.balance?.isGreaterThan(0) && collateral.isAuthorized;
        },
    },
});
</script>

<style scoped>
.Table {
    @apply w-full border-2 border-gray-300 dark:border-gray-600 bg-transparent;
}

.Element {
    @apply p-2 h-8 border-r-2 border-b-2 border-gray-300 dark:border-gray-600;
}

.Heading > th {
    @apply Element text-gray-700 dark:text-gray-100;
}

.Body > td {
    @apply Element text-gray-500 dark:text-gray-300;
}

.Button {
    @apply text-primary hover:text-primary-light underline;
}

.Button:disabled {
    @apply text-gray-400 dark:text-gray-500 no-underline cursor-not-allowed;
}
</style>
