<template>
    <div>
        <table class="Table">
            <tr>
                <th class="Heading">Callee Contract</th>
                <th class="Heading">Address</th>
            </tr>
            <tbody v-if="!isCalleesEmpty">
                <tr v-for="[callee, address] of Object.entries(callees)" :key="callee">
                    <td class="Body">
                        <span>{{ callee }}</span>
                    </td>
                    <td class="Body">
                        <format-address type="address" :value="address" />
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="isCalleesEmpty" class="flex h-10 border-2 border-t-0 border-gray-300 dark:border-gray-600">
            <span class="NoContracts"> No Callee Contracts found for this network. </span>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';

export default Vue.extend({
    components: {
        FormatAddress,
    },
    props: {
        callees: {
            type: Object as Vue.PropType<CalleeAddresses>,
            default: () => ({}),
        },
    },
    computed: {
        isCalleesEmpty() {
            return Object.keys(this.callees).length === 0;
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

.Body {
    @apply Element text-gray-500 dark:text-gray-300;
}

.Heading {
    @apply Element text-gray-700 dark:text-gray-100;
}

.NoContracts {
    @apply flex items-center justify-center text-gray-700 dark:text-gray-100 w-full h-full bg-gray-200 dark:bg-gray-700 opacity-50;
}
</style>
