<template>
    <ComingSoon :last-updated="lastUpdated" />
</template>

<script lang="ts">
import Vue from 'vue';
import '~/assets/styles/index';
import ComingSoon from '~/components/common/other/ComingSoon.vue';

export default Vue.extend({
    components: { ComingSoon },
    data() {
        return {
            lastUpdated: 1635336000000,
        };
    },
});
</script>
