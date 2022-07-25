<template>
    <div class="flex items-center">
        <nuxt-link to="/" class="hidden md:block text-gray-700 hover:text-gray-600 no-underline">
            <branding-icon class="h-12 w-12" />
        </nuxt-link>
        <Select :options="options" :value="pageName" title="Unified Auction" class="md:ml-2 mb-0">
            <template #text-prefix>
                <branding-icon class="md:hidden h-12 w-12" />
            </template>
        </Select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Select from '../common/inputs/Select.vue';
import { generateLink } from '../../helpers/generateLink';
import BrandingIcon from '~/assets/icons/logo.svg';

export default Vue.extend({
    name: 'HeaderLogo',
    components: { Select, BrandingIcon },
    props: {
        network: {
            type: String,
            default: undefined,
        },
        pageName: {
            type: String,
            default: undefined,
        },
    },
    computed: {
        options(): SelectOption[] {
            return [
                { label: 'Maker Auction Services', value: '', href: generateLink(this.network, '') },
                { label: 'Collateral auctions', value: 'collateral', href: generateLink(this.network, 'collateral') },
                { label: 'Surplus auctions', value: 'surplus', href: generateLink(this.network, 'surplus') },
            ];
        },
    },
});
</script>
