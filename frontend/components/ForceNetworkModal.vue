<template>
    <modal
        :visible="isInvalidNetwork"
        :mask-closable="false"
        :closable="false"
        :footer="null"
        class="my-0"
        title="Error switching networks."
    >
        <Alert type="error" :message="errorMessage" banner />
        <ul class="py-3">
            <li
                v-for="option in options"
                :key="option.value"
                class="w-full hover:bg-primary px-4 py-2 cursor-pointer flex"
                @click="$emit('updateNetwork', option.value)"
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
import NETWORKS from '~/lib/constants/NETWORKS';

export default Vue.extend({
    name: 'ForceNetworkModal',
    components: { Modal, Alert },
    props: {
        isInvalidNetwork: {
            type: Boolean,
            default: false,
        },
        chainId: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            options: [
                ...Object.entries(NETWORKS).map(([name, propeties]) => {
                    return { label: propeties.title, value: name as string | null };
                }),
            ],
        };
    },
    computed: {
        errorMessage(): string {
            return `Network "${this.chainId}" is not supported, please change it to a known one:`;
        },
    },
});
</script>
