<template>
    <Select :value="network" :options="options" @input="$emit('update:network', $event)">
        <template #text-prefix>
            <icon type="share-alt" class="pr-2" />
        </template>
    </Select>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';
import Select from '~/components/common/Select.vue';
import NETWORKS from '~/lib/constants/NETWORKS';

export default Vue.extend({
    name: 'NetworkSelector',
    components: {
        Icon,
        Select,
    },
    props: {
        network: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            options: [
                ...Object.entries(NETWORKS).map(([name, propeties]) => {
                    return { label: propeties.title, value: name as string | null };
                }),
                { label: 'Fake data', value: null },
            ],
        };
    },
});
</script>
