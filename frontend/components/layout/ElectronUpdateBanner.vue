<template>
    <Alert v-if="status === 'error'" type="warning" show-icon banner closable class="text-center">
        <template #message>
            Automatic check for updates failed. Please check for the newer version manually at:
            <a :href="url" target="_blank" class="underline">{{ url }}</a
            >. Current version: v{{ version }}.
        </template>
    </Alert>
    <Alert v-else-if="status === 'available'" type="error" show-icon banner class="text-center bg-red-400">
        <template #message>
            A newer version of this app is available for download at
            <a :href="url" target="_blank" class="underline">{{ url }}</a
            >. Current version: v{{ version }}.
        </template>
    </Alert>
</template>

<script lang="ts">
import Vue from 'vue';
import { Alert } from 'ant-design-vue';

export default Vue.extend({
    name: 'ElectronUpdateBanner',
    components: { Alert },
    props: {
        status: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        version: {
            type: String,
            required: true,
        },
        errorMessage: {
            type: String,
            default: '',
        },
    },
});
</script>
