<template>
    <Select :value="network" :options="options" title="Select Network" @input="$emit('update:network', $event)">
        <template #text-prefix>
            <icon type="share-alt" class="pr-2 text-3xl md:text-sm" />
        </template>
    </Select>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';
import { NetworkConfig } from 'auctions-core/dist/src/types';
import Select from '~/components/common/Select.vue';

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
        networks: {
            type: Array as Vue.PropType<NetworkConfig[]>,
            default: () => [],
        },
        isDev: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            options: [
                ...this.networks.map(([name, properties]) => {
                    return { label: properties.title, value: name as string | null };
                }),
            ],
        };
    },
});
</script>
