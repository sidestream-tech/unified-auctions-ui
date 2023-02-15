<template>
    <div class="w-full py-2 text-center bg-red-400">
        <h1>
            A new version is available for download at
            <a class="underline" :href="url" target="_blank">
                {{ url }}
            </a>
        </h1>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'ElectronUpdateBanner',
    props: {
        url: {
            type: String,
            required: true,
        },
    },
});
</script>
