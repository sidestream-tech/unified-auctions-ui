<template>
    <Select v-model="selectedNetwork" :options="options" @input="$emit('select', $event)" />
</template>

<script lang="ts">
import Vue from 'vue';
import Select from '~/components/common/Select.vue';

export default Vue.extend({
    name: 'NetworkSelector',
    components: {
        Select,
    },
    data() {
        return {
            options: [
                { label: 'Main', value: 'main' },
                { label: 'Kovan', value: 'kovan' },
            ],
            selectedNetwork: 'main',
        };
    },
});
</script>
