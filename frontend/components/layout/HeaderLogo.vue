<template>
    <div class="flex items-center">
        <nuxt-link to="/" class="hidden md:block text-gray-700 hover:text-gray-600 no-underline">
            <branding-icon class="h-12 w-12" />
        </nuxt-link>
        <Select :options="options" title="Unified Auction" class="md:ml-2 mb-0" @input="switchPage">
            <template #text-prefix>
                <branding-icon class="md:hidden h-12 w-12" />
            </template>
        </Select>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Select from '../common/inputs/Select.vue';
import BrandingIcon from '~/assets/icons/logo.svg';

export default Vue.extend({
    name: 'HeaderLogo',
    components: { Select, BrandingIcon },
    computed: {
        options() {
            return [
                { label: 'Maker Auction Services', value: '' },
                { label: '> Collateral auctions', value: 'collateral' },
                { label: 'Surplus auctions', value: 'surplus' },
            ];
        },
    },
    methods: {
        switchPage(page: string) {
            if (this.$router) {
                this.$router.push(`/${page}`);
            }
        },
    },
});
</script>
