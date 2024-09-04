<template>
    <div>
        <Select
            v-if="!isChangingNetwork"
            :value="network"
            :options="options"
            title="Select Network"
            class="text-white"
            @input="updateNetworkOrChangeUrl($event)"
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
import Vue, { PropType } from 'vue';
import { Icon } from 'ant-design-vue';
import { NetworkConfig } from 'auctions-core/src/types';
import Select from '~/components/common/inputs/Select.vue';

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
            type: Array as PropType<NetworkConfig[]>,
            default: () => [] as NetworkConfig[],
        },
        isChangingNetwork: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        options() {
            return [
                ...this.networks.map(eachNetwork => ({ label: eachNetwork.title, value: eachNetwork.type })),
                { label: 'Change RPC URL', value: 'changeRpcUrl' },
            ];
        },
    },
    methods: {
        updateNetworkOrChangeUrl(value: string): void {
            if (value === 'changeRpcUrl') {
                this.$emit(value);
            } else {
                this.$emit('update:network', value);
            }
        },
    },
});
</script>
