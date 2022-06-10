<template>
    <modal
        :visible="true"
        :mask-closable="false"
        :closable="false"
        :footer="null"
        class="my-0"
        title="Unsupported network type"
        destroy-on-close
    >
        <Alert type="error" banner>
            <template #message>
                Network "<span class="font-medium">{{ invalidNetwork }}</span
                >" is not supported, please change it to a supported one:
            </template>
        </Alert>
        <ul class="py-3">
            <li
                v-for="option in options"
                :key="option.value"
                class="w-full hover:bg-primary px-5 py-2 cursor-pointer flex"
                @click="$emit('setPageNetwork', option.value)"
            >
                <component :is="option.icon" v-if="option.icon" class="w-8 pr-3" />
                {{ option.label }}
            </li>
        </ul>
    </modal>
</template>

<script lang="ts">
import { Modal, Alert } from 'ant-design-vue';
import Vue from 'vue';
import { NetworkConfig } from 'auctions-core/dist/src/types';

export default Vue.extend({
    name: 'ChangePageNetworkModal',
    components: { Modal, Alert },
    props: {
        invalidNetwork: {
            type: String,
            default: '',
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
