<template>
    <div class="flex items-center">
        <nuxt-link :to="rootUrl" class="hidden md:block white hover:text-gray-600 no-underline">
            <branding-icon class="h-8 py-1" />
        </nuxt-link>
        <Select :options="options" :value="pageName" title="Unified Auctions" class="md:ml-2 mb-0 text-white">
            <template #text-prefix>
                <branding-mono-icon class="md:hidden h-10 py-1" />
            </template>
        </Select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Select from '../common/inputs/Select.vue';
import { generateLink } from '../../helpers/generateLink';
import BrandingIcon from '~/assets/icons/logo.svg';
import BrandingMonoIcon from '~/assets/icons/logo-mono.svg';

export default Vue.extend({
    name: 'HeaderLogo',
    components: { Select, BrandingIcon, BrandingMonoIcon },
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
        rootUrl() {
            return generateLink(this.network, '');
        },
        options(): SelectOption[] {
            return [
                { label: 'Unified auctions', value: '', href: this.rootUrl },
                { label: 'Collateral auctions', value: 'collateral', href: generateLink(this.network, 'collateral') },
                { label: 'Surplus auctions', value: 'surplus', href: generateLink(this.network, 'surplus') },
                { label: 'Debt auctions', value: 'debt', href: generateLink(this.network, 'debt') },
                { label: 'Vault liquidations', value: 'vaults', href: generateLink(this.network, 'vaults') },
            ];
        },
    },
});
</script>
