<template>
    <table class="Table">
        <tr>
            <th class="Element">Callee Contract</th>
            <th class="Element">Address</th>
        </tr>
        <tr>
            <td class="Element">
                <format-address value="" />
            </td>
            <td class="Element">
                <format-address value="" />
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
    props: {},
});
</script>

<style scoped>
.Table {
    @apply w-full;
    @apply border-2 border-gray-300 dark:border-gray-600 bg-transparent;
}

.Element {
    @apply p-2 h-8 text-left;
    @apply border-r-2 border-b-2 border-gray-300 dark:border-gray-600;
}
</style>
