<template>
    <div>
        <StagingBanner v-if="stagingBannerUrl" :url="stagingBannerUrl" />
        <!-- Sky banner -->
        <div class="w-full p-2 text-center bg-banner-red">
            <h1 class="text-white">
                MakerDAO is now Sky — the next evolution of DeFi. Explore
                <a class="underline" href="https://sky.money/" target="_blank">Sky.money</a> and get rewarded for
                saving without giving up control.
            </h1>
        </div>
        <header class="bg-gradient-to-b from-primary to-primary-purple dark:from-primary-dark dark:to-primary">
            <nav class="flex items-center py-2 px-4 md:px-10">
                <HeaderLogo :network="network" :page-name="pageName" />

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
                        <span class="text-white">Explanations</span>
                    </label>

                    <div class="flex space-x-4">
                        <NetworkSelector
                            v-if="isAuctionsPortal || isDefaultHeader"
                            :network="network"
                            :networks="networks"
                            :is-changing-network="isChangingNetwork"
                            @update:network="$emit('update:network', $event)"
                            @changeRpcUrl="$emit('changeRpcUrl')"
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
import Vue, { PropType } from 'vue';
import { NetworkConfig } from 'auctions-core/src/types';
import StagingBanner from './StagingBanner.vue';
import HeaderLogo from './HeaderLogo.vue';

import BaseSwitch from '~/components/common/inputs/BaseSwitch.vue';
import NetworkSelector from '~/components/layout/NetworkSelector.vue';
import WalletSelector from '~/components/layout/WalletSelector.vue';
import ThemeSwitcher from '~/components/layout/ThemeSwitcher.vue';

export default Vue.extend({
    name: 'Header',
    components: {
        HeaderLogo,
        StagingBanner,
        ThemeSwitcher,
        BaseSwitch,
        NetworkSelector,
        WalletSelector,
    },
    props: {
        type: {
            type: String,
            default: 'default',
        },
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
        networks: {
            type: Array as PropType<NetworkConfig[]>,
            default: () => [] as NetworkConfig[],
        },
        isChangingNetwork: {
            type: Boolean,
            default: false,
        },
        pageName: {
            type: String,
            default: '',
        },
    },
    computed: {
        isUnifiedPage(): boolean {
            return this.type === 'unified';
        },
        isMinimalPage(): boolean {
            return this.type === 'minimal';
        },
        isAuctionsPortal(): boolean {
            return this.type === 'auctions';
        },
        isDefaultHeader(): boolean {
            return this.type === 'default';
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
