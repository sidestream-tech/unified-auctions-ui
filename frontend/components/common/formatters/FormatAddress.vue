<template>
    <component :is="disable ? 'span' : 'a'" :href="url" target="_blank" :title="value">
        <span v-if="explicit"> View on Etherscan </span>
        <span v-else class="inline-flex max-w-full">
            <span>{{ addressStart }}</span>
            <span class="truncate">{{ addressMiddle }}</span>
            <span>{{ addressEnd }}</span>
        </span>
    </component>
</template>

<script lang="ts">
import Vue from 'vue';
import { NetworkConfig } from 'auctions-core/src/types';

const TRIM_POSITION_FROM_START = 5;
const TRIM_POSITION_FROM_END = 4;

export default Vue.extend({
    name: 'FormatAddress',
    props: {
        value: {
            type: String,
            required: true,
        },
        shorten: {
            type: Boolean,
            default: false,
        },
        explicit: {
            type: Boolean,
            default: false,
        },
        disable: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'tx',
        },
    },
    computed: {
        addressStart(): string {
            return this.value.substr(0, TRIM_POSITION_FROM_START);
        },
        addressMiddle(): string {
            return this.shorten
                ? '...'
                : this.value.substr(TRIM_POSITION_FROM_START, this.value.length - TRIM_POSITION_FROM_END);
        },
        addressEnd(): string {
            return this.value.substr(this.value.length - TRIM_POSITION_FROM_END);
        },
        url(): string {
            return `${this.etherscanURL}/${this.type}/${this.value}`;
        },
        etherscanURL(): string {
            if (!this.$store) {
                return 'https://etherscan.io';
            }
            const network = this.$store.getters['network/getMakerNetwork'];
            if (!network) {
                return 'https://etherscan.io';
            }
            const networkConfig: NetworkConfig = this.$store.getters['network/getNetworkConfigByType'](network);
            if (networkConfig) {
                return networkConfig.etherscanUrl;
            }
            return 'https://etherscan.io';
        },
    },
});
</script>
