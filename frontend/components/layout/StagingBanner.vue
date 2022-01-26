<template>
    <div class="w-full py-2 text-center bg-red-400">
        <h1>
            This is a staging environment for testing purposes only. The production is at
            <a class="underline" href="https://auctions.makerdao.network/" target="_blank">https://auctions.makerdao.network</a>.
        </h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'StagingHeader',
});
</script>
