<template>
    <div class="w-full py-2 text-center bg-red-400">
        <h1>
            A new version (v{{ version }}) is available for download at
            <a
                class="underline"
                href="https://github.com/sidestream-tech/unified-auctions-ui/releases/latest/"
                target="_blank"
            >
                https://github.com/sidestream-tech/unified-auctions-ui/releases/latest/
            </a>
        </h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'ElectronUpdateBanner',
    props: {
        version: {
            type: String,
            required: true,
        },
    },
});
</script>
