<template>
    <div>
        <StagingBanner v-if="stagingBannerUrl" :url="stagingBannerUrl" />
        <header class="bg-primary dark:bg-primary-dark">
            <nav class="flex items-center py-2 px-4 md:px-10">
                <nuxt-link :to="logoTarget" class="flex items-center text-gray-700 hover:text-gray-600 no-underline">
                    <branding-icon class="h-12 w-12" />
                    <div v-if="isAuctionsPortal" class="ml-2 mb-0 hidden md:block">
                        <span class="capitalize">{{ pageName }}</span> auctions
                    </div>
                    <span v-else class="ml-2 mb-0 hidden md:block"> Unified Auctions </span>
                </nuxt-link>

                <div class="flex-1 flex justify-end space-x-4 items-center">
                    <label
                        v-if="!isMinimalPage"
                        class="flex items-center space-x-2 cursor-pointer select-none pt-1 md:pt-0"
                    >
                        <BaseSwitch
                            :is-checked="isExplanationsShown"
                            class="mt-px"
                            @update:isChecked="$emit('update:isExplanationsShown', $event)"
                        />
                        <span class="text-gray-700">Explanations</span>
                    </label>

                    <div class="flex space-x-4">
                        <NetworkSelector
                            v-if="isAuctionsPortal || isDefaultHeader"
                            :network="network"
                            :is-dev="isDev"
                            @update:network="$emit('update:network', $event)"
                        />

                        <WalletSelector
                            v-if="isAuctionsPortal || isDefaultHeader"
                            class="hidden sm:block"
                            :wallet-address="walletAddress"
                            :is-loading="isWalletLoading"
                            :is-modal-open="isWalletModalOpen"
                            :has-accepted-terms="hasAcceptedTerms"
                            @update:isModalOpen="$emit('update:isModalOpen', $event)"
                            @changeWalletType="$emit('changeWalletType', $event)"
                            @openWalletModal="$emit('openWalletModal')"
                            @openTermsModal="$emit('openTermsModal')"
                            @openManageCollateralModal="$emit('openManageCollateralModal')"
                        />

                        <ThemeSwitcher :dark-mode="darkMode" @update="$emit('update:darkMode', $event)" />
                    </div>
                </div>
            </nav>
        </header>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import StagingBanner from './StagingBanner.vue';
import BrandingIcon from '~/assets/icons/logo.svg';
import BaseSwitch from '~/components/common/BaseSwitch.vue';
import NetworkSelector from '~/components/utils/NetworkSelector.vue';
import WalletSelector from '~/components/utils/WalletSelector.vue';
import ThemeSwitcher from '~/components/utils/ThemeSwitcher.vue';

const AUCTION_PORTAL_PAGES = ['collateral', 'surplus'];
const MINIMAL_PAGES = ['privacy'];
const UNIFIED_PAGES = ['index'];

export default Vue.extend({
    name: 'Header',
    components: {
        StagingBanner,
        ThemeSwitcher,
        BrandingIcon,
        BaseSwitch,
        NetworkSelector,
        WalletSelector,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            required: true,
        },
        network: {
            type: String,
            default: null,
        },
        darkMode: {
            type: Boolean,
            default: false,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isWalletLoading: {
            type: Boolean,
            default: false,
        },
        isWalletModalOpen: {
            type: Boolean,
            default: false,
        },
        hasAcceptedTerms: {
            type: Boolean,
            default: false,
        },
        stagingBannerUrl: {
            type: String,
            default: undefined,
        },
        isDev: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isUnifiedPage(): boolean {
            return UNIFIED_PAGES.includes(this.pageName);
        },
        isMinimalPage(): boolean {
            return MINIMAL_PAGES.includes(this.pageName);
        },
        isAuctionsPortal(): boolean {
            return AUCTION_PORTAL_PAGES.includes(this.pageName);
        },
        isDefaultHeader(): boolean {
            return !this.isUnifiedPage && !this.isMinimalPage && !this.isAuctionsPortal;
        },
        pageName(): string {
            return this.$route?.name || '';
        },
        logoTarget(): string {
            if (this.isAuctionsPortal) {
                return `/${this.pageName}`;
            }
            return '/';
        },
    },
});
</script>
