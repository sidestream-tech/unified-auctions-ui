<template>
    <div></div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    created() {
        this.loadAnalytics();
    },
    methods: {
        loadAnalytics() {
            const heapIO = (window as any).heap as Heap;
            if (!heapIO) {
                console.warn('heapIO initialization failed. Analytics are disabled.');
                return;
            }
            if (!heapIO.load) {
                // heapIO is already loaded.
                return;
            }
            if (!process.env.HEAPIO_ID) {
                console.warn('HEAPIO_ID is not defined. Analytics are disabled.');
                return;
            }
            heapIO.load(process.env.HEAPIO_ID);
        },
    },
});
</script>
