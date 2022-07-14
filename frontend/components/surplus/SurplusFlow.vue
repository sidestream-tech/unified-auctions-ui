<template>
    <div :class="isStagingEnvironment ? 'SplitLayoutStagingContainer' : 'SplitLayoutContainer'">
        <SplitLayout :step.sync="step">
            <template #step0>
                <div v-if="isExplanationsShown" class="h-1/2">
                    <LandingBlock title="Surplus auctions" @explanations="explanationsTrigger" />
                </div>
                <div class="mx-4 md:mx-0 SurplusTextContainer">
                    <SurplusText
                        ref="surplusText"
                        :auctions="auctions"
                        :selected-auction-id="selectedAuctionId"
                        :are-auctions-fetching="areAuctionsFetching"
                        :last-updated="lastUpdated"
                        :auctions-error="auctionsError"
                        :is-explanations-shown="isExplanationsShown"
                        @selectedAuctionId:update="$emit('selectedAuctionId:update', $event)"
                    />
                </div>
            </template>
            <template #step1>
                <SurplusAuction
                    class="mt-6 mb-8 mx-8"
                    :auction="selectedAuction"
                    :auction-id="selectedAuctionId"
                    :auction-action-state="selectedAuctionActionState"
                    :are-auctions-fetching="areAuctionsFetching"
                    :is-explanations-shown="isExplanationsShown"
                    :error="selectedAuctionError"
                    :wallet-address="walletAddress"
                    :is-connecting="isConnectingWallet"
                    @restart="$emit('restart', $event)"
                    @connect="$emit('connectWallet')"
                    @disconnect="$emit('disconnectWallet')"
                    @bid="bid()"
                />
            </template>
            <template #step2>
                <SurplusAuctionTransactionFlow
                    v-if="selectedAuction"
                    class="mt-6 mb-8 mx-8"
                    :auction="selectedAuction"
                    :auction-action-state="selectedAuctionActionState"
                    :wallet-address="walletAddress"
                    :wallet-m-k-r="walletMKR"
                    :allowance-m-k-r="allowanceMKR"
                    :network="network"
                    :token-address="tokenAddress"
                    :is-connecting-wallet="isConnectingWallet"
                    :is-refreshing-wallet="isRefreshingWallet"
                    :is-setting-allowance="isSettingAllowance"
                    :is-explanations-shown="isExplanationsShown"
                    @connectWallet="$emit('connectWallet')"
                    @disconnectWallet="$emit('disconnectWallet')"
                    @refreshWallet="$emit('refreshWallet')"
                    @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
                    @bid="$emit('bid', $event)"
                    @collect="$emit('collect')"
                />
            </template>
        </SplitLayout>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SurplusAuctionActionStates, SurplusAuctionTransaction, WalletBalances } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import SurplusAuction from '~/components/surplus/SurplusAuction';
import SurplusAuctionTransactionFlow from '~/components/surplus/SurplusAuctionTransactionFlow.vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import SplitLayout from '~/components/layout/SplitLayout.vue';
import SurplusText from '~/components/surplus/SurplusText.vue';

export default Vue.extend({
    components: {
        SurplusAuctionTransactionFlow,
        SurplusAuction,
        LandingBlock,
        SplitLayout,
        SurplusText,
    },
    props: {
        auctions: {
            type: Array as Vue.PropType<SurplusAuctionTransaction[]>,
            default: () => [],
        },
        selectedAuctionId: {
            type: Number,
            default: null,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        walletBalances: {
            type: Object as Vue.PropType<WalletBalances>,
            default: null,
        },
        allowanceMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isConnectingWallet: {
            type: Boolean,
            default: false,
        },
        isRefreshingWallet: {
            type: Boolean,
            default: false,
        },
        isSettingAllowance: {
            type: Boolean,
            default: false,
        },
        areAuctionsFetching: {
            type: Boolean,
            default: false,
        },
        auctionsError: {
            type: String,
            default: null,
        },
        auctionErrors: {
            type: Object as Vue.PropType<string, string>,
            default: () => ({}),
        },
        auctionActionState: {
            type: Object as Vue.PropType<string, SurplusAuctionActionStates>,
            default: () => ({}),
        },
        lastUpdated: {
            type: Date,
            default: null,
        },
        tokenAddress: {
            type: String,
            default: null,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data: () => ({
        step: 0,
        secondStep: '',
    }),
    computed: {
        selectedAuction(): SurplusAuctionTransaction | undefined {
            return (
                this.auctions.find(auctionTransaction => auctionTransaction.id === this.selectedAuctionId) || undefined
            );
        },
        selectedAuctionError(): string | undefined {
            return this.auctionErrors[this.selectedAuctionId] || undefined;
        },
        selectedAuctionActionState(): string | undefined {
            return this.auctionActionState[this.selectedAuctionId] || undefined;
        },
        isStagingEnvironment(): boolean {
            return !!process.env.STAGING_BANNER_URL;
        },
        walletMKR(): BigNumber | undefined {
            return this.walletBalances?.walletMKR || undefined;
        },
    },
    watch: {
        selectedAuctionId: {
            immediate: true,
            handler(newSelectedAuctionId) {
                if (!newSelectedAuctionId) {
                    this.step = 0;
                } else {
                    this.step = 1;
                }
            },
        },
        step: {
            immediate: true,
            handler(newStep) {
                if (newStep === 0) {
                    this.$emit('update:selectedAuctionId', null);
                }
            },
        },
    },
    methods: {
        explanationsTrigger(event: boolean): void {
            if (event === true && this.$refs.surplusText) {
                (this.$refs.surplusText as Vue).$el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
            this.$emit('update:isExplanationsShown', event);
        },
        bid() {
            this.step = 2;
            this.secondStep = 'bid';
        },
    },
});
</script>

<style scoped>
.SplitLayoutContainer {
    height: calc(100vh - 4rem);
}

.SplitLayoutStagingContainer {
    margin-top: 2.3rem;
    height: calc(100vh - 6.3rem);
}

.SurplusTextContainer {
    min-height: calc(100vh - 10rem);
}
</style>
