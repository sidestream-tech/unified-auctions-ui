<template>
    <Select v-model="selectedNetwork" :options="options" @input="$emit('select', $event)">
        <template #text-prefix>
            <icon type="share-alt" class="pr-2" />
        </template>
    </Select>
</template>

<script lang="ts">
import { Icon } from 'ant-design-vue';

import Vue from 'vue';
import Select from '~/components/common/Select.vue';

export default Vue.extend({
    name: 'NetworkSelector',
    components: {
        Icon,
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
