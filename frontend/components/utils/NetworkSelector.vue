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
import { getNetworks } from 'auctions-core/src/constants/NETWORKS';
import Select from '~/components/common/Select.vue';
import { FAKE_NETWORK_NAME } from '~/store/network';

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
        isDev: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            options: [
                ...Object.entries(getNetworks(this.isDev)).map(([name, propeties]) => {
                    return { label: propeties.title, value: name as string | null };
                }),
                { label: 'Stub data', value: FAKE_NETWORK_NAME },
            ],
        };
    },
});
</script>
