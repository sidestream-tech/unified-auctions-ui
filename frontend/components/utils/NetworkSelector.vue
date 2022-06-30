<template>
    <div>
        <Select
            v-if="!isChangingNetwork"
            :value="network"
            :options="options"
            title="Select Network"
            @input="$emit('update:network', $event)"
        >
            <template #text-prefix>
                <icon type="share-alt" class="pr-2 text-3xl md:text-sm" />
            </template>
        </Select>
        <div v-else>
            <icon type="loading" class="pr-2 text-3xl md:text-sm" />
            <span>Switching...</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';
import { NetworkConfig } from 'auctions-core//src/types';
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
        isChangingNetwork: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        options() {
            return [
                ...this.networks.map((network: NetworkConfig) => {
                    return { label: network.title, value: network.title as string | null };
                }),
            ];
        },
    },
});
</script>
