<template>
    <header class="bg-primary">
        <nav class="flex items-center py-2 px-10">
            <nuxt-link to="/" class="flex items-center text-gray-700 hover:text-gray-500">
                <branding-icon class="h-12 w-12" />
                <span class="ml-2 mb-0 hidden md:block"> maker liquidations </span>
            </nuxt-link>
            <div class="flex-1 flex justify-end space-x-8">
                <network-selector @select="$emit('selectNetwork', $event)" />
                <a class="text-gray-700 hover:text-gray-500"> Connect a Wallet </a>
            </div>
        </nav>
    </header>
</template>

<script lang="ts">
import Vue from 'vue';
import NetworkSelector from '~/components/utils/NetworkSelector';
import BrandingIcon from '~/assets/icons/logo.svg';

export default Vue.extend({
    name: 'Header',
    components: {
        BrandingIcon,
        NetworkSelector,
    },
});
</script>
