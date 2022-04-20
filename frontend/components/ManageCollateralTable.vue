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
                <tr v-for="collateralStatus of collateralStatuses" :key="collateralStatus.type" class="Body">
                    <td>
                        {{ collateralStatus.type }}
                    </td>
                    <td>
                        <format-address :value="collateralStatus.address" shorten />
                    </td>
                    <td>
                        <span v-if="collateralStatus.isAuthorized">Authorized</span>
                        <button v-else class="Button" @click="$emit('authorizeCollateral', collateralStatus.type)">
                            Authorize
                        </button>
                    </td>
                    <td>
                        <button
                            :disabled="!canWithdrawCollateral(collateralStatus)"
                            class="Button"
                            @click="$emit('withdrawCollateral', collateralStatus.type)"
                        >
                            Withdraw
                        </button>
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

export default Vue.extend({
    components: {
        TextBlock,
        FormatAddress,
        FormatCurrency,
    },
    props: {
        collateralStatuses: {
            type: Object as Vue.PropType<CollateralStatus>,
            default: undefined,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
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
</style>
