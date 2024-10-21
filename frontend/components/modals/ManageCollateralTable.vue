<template>
    <TextBlock>
        <TextBlock v-if="isExplanationsShown" class="mb-2">
            This is a list of collaterals supported by the Maker Protocol. Each row provides the possibility to
            withdraw collateral from the VAT (if there is any) and to pre-authorize VAT transactions.
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
                            <CurrencyIcon :currency-symbol="collateralStatus.tokenName" />
                            {{ collateralStatus.type }}
                        </div>
                    </td>
                    <td>
                        <span v-if="collateralStatus.address === undefined" class="opacity-50">Fetching</span>
                        <span v-else-if="collateralStatus.address === null" class="opacity-50">Not found</span>
                        <format-address v-else :value="collateralStatus.address" shorten type="address" />
                    </td>
                    <td>
                        <template v-if="collateralStatus.address">
                            <span v-if="collateralStatus.isAuthorized">Authorized</span>
                            <BaseButton
                                v-else
                                class="w-full"
                                :is-loading="collateralStatus.isAuthorizing"
                                @click="$emit('authorizeCollateral', collateralStatus.type)"
                            >
                                Authorize
                            </BaseButton>
                        </template>
                    </td>
                    <td>
                        <template v-if="collateralStatus.address">
                            <Tooltip :title="generateWithdrawalErrorMessage(collateralStatus)" placement="top">
                                <div>
                                    <BaseButton
                                        class="w-full"
                                        :disabled="!canWithdrawCollateral(collateralStatus)"
                                        :is-loading="collateralStatus.isDepositingOrWithdrawing"
                                        @click="$emit('withdrawCollateral', collateralStatus.type)"
                                    >
                                        <span class="mr-1">Withdraw</span
                                        ><format-currency :value="collateralStatus.balance" />
                                    </BaseButton>
                                </div>
                            </Tooltip>
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import { Tooltip } from 'ant-design-vue';
import { CollateralStatus } from 'auctions-core/src/types';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import CurrencyIcon from '~/components/common/other/CurrencyIcon.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';

export default Vue.extend({
    components: {
        Tooltip,
        TextBlock,
        FormatAddress,
        FormatCurrency,
        CurrencyIcon,
        BaseButton,
    },
    props: {
        collateralStatuses: {
            type: Array as Vue.PropType<CollateralStatus[]>,
            default: () => [],
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
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
        canWithdrawCollateral(collateral: CollateralStatus): boolean {
            return collateral.balance?.isGreaterThan(0) && collateral.isAuthorized;
        },
        generateWithdrawalErrorMessage(collateral: CollateralStatus): string | undefined {
            if (!collateral.balance?.isGreaterThan(0)) {
                return `There is no ${collateral.type} collateral to withdraw`;
            }
            if (!collateral.isAuthorized) {
                return `The ${collateral.type} collateral needs to be authorized first`;
            }
        },
    },
});
</script>

<style scoped>
.Table {
    @apply w-full border-2 border-gray-300 dark:border-gray-600 bg-transparent;
}

.Element {
    @apply p-2 h-12 border-r-2 border-b-2 border-gray-300 dark:border-gray-600;
}

.Heading > th {
    @apply Element text-gray-700 dark:text-gray-100;
}

.Body > td {
    @apply Element text-gray-500 dark:text-gray-300;
}
</style>
