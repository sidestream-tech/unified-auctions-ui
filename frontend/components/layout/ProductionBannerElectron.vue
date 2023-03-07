<template>
    <div class="w-full py-2 text-center bg-yellow-400">
        <h1>
            You can now run the Unified Auctions UI locally as a Desktop application. Please see its release
            <a class="underline" :href="url" target="_blank">{{ url }}</a> .
        </h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'ProductionHeaderElectrong',
    props: {
        url: {
            type: String,
            required: true,
        },
    },
});
</script>
