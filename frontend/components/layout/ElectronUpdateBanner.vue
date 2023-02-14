<template>
    <div class="w-full py-2 text-center bg-red-400">
        <h1>
            A new version (v{{ version }}) is available for download at
            <a class="underline" :href="latestReleaseUrl" target="_blank">
                {{ latestReleaseUrl }}
            </a>
        </h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { repository } from '~/package.json';

export default Vue.extend({
    name: 'ElectronUpdateBanner',
    props: {
        version: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            latestReleaseUrl: `${repository.url}/releases/latest`,
        };
    },
});
</script>
