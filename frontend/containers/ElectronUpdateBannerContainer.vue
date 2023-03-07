<template>
    <ElectronUpdateBanner v-if="result" v-bind="result" />
</template>

<script lang="ts">
import Vue from 'vue';
import { message } from 'ant-design-vue';
import ElectronUpdateBanner from '~/components/layout/ElectronUpdateBanner.vue';

export default Vue.extend({
    components: {
        ElectronUpdateBanner,
    },
    data() {
        return {
            result: null,
        };
    },
    async mounted() {
        // check if running in Electron
        // source: https://github.com/electron/electron/issues/2288#issuecomment-337858978
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes(' electron/')) {
            try {
                this.result = await window.electronAPI?.checkForUpdates();
            } catch {
                // should never be the case
                message.error(`Cannot check for updates for unknown reason`);
            }
        }
    },
});
</script>
