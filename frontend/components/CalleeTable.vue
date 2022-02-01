<template>
    <table class="Table">
        <tr>
            <th class="Heading">Callee Contract</th>
            <th class="Heading">Address</th>
        </tr>
        <tr>
            <td class="Body">
                <span></span>
            </td>
            <td class="Body">
                <format-address type="address" value="" />
            </td>
        </tr>
        <tr>
            <td class="Body">
                <span></span>
            </td>
            <td class="Body">
                <format-address type="address" value="" />
            </td>
        </tr>
    </table>
</template>
<script lang="ts">
import Vue from 'vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';

export default Vue.extend({
    components: {
        FormatAddress,
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
</style>
