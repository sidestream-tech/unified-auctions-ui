<template>
    <div>
        <SplitLayout :step.sync="step">
            <template #step0>
                <div v-if="isExplanationsShown" class="h-1/2">
                    <LandingBlock @explanations="explanationsTrigger" />
                </div>
                <div class="mx-4 md:mx-0 MainTextContainer">
                    <CollateralAuctionText
                        ref="mainText"
                        :auctions="auctions"
                        :auctions-error="auctionsError"
                        :is-auctions-loading="areAuctionsFetching"
                        :selected-auction-id="selectedAuctionId"
                        :is-explanations-shown="isExplanationsShown"
                        :last-updated="lastUpdated"
                        @selectedAuctionId:update="$emit('selectedAuctionId:update', $event)"
                    />
                </div>
            </template>
            <template #step1>
                <div>
                    <CollateralAuction
                        v-if="selectedAuctionId"
                        :is-explanations-shown="isExplanationsShown"
                        class="mt-6 mb-8 mx-8"
                        :auction="selectedAuction"
                        :take-events="selectedTakeEvents"
                        :wallet-address="walletAddress"
                        :auction-id="selectedAuctionId"
                        :are-auctions-fetching="areAuctionsFetching || isSelectedAuctionFetching"
                        :are-take-events-fetching="areTakeEventsFetching"
                        :error="selectedAuctionError"
                        @restart="$emit('restart', $event)"
                        @connect="$emit('connect')"
                        @disconnect="$emit('disconnect')"
                        @swap="swap()"
                        @purchase="purchase()"
                        @fetchTakeEventsFromAuction="$emit('fetchTakeEventsFromAuction', $event)"
                    />
                </div>
            </template>
            <template #step2>
                <CollateralAuctionSwapTransaction
                    v-if="selectedAuction && secondStep === 'swap'"
                    class="mt-6 mb-8 mx-8"
                    :auction-transaction="selectedAuction"
                    :is-connecting="isConnecting"
                    :is-authorizing="isAuthorizing"
                    :is-wallet-authorized="isWalletAuthorized"
                    :authorised-collaterals="authorisedCollaterals"
                    :is-executing="isExecuting"
                    :wallet-address="walletAddress"
                    :is-explanations-shown="isExplanationsShown"
                    :is-autorouting-enabled="isAutoroutingEnabled"
                    @connect="$emit('connect')"
                    @disconnect="$emit('disconnect')"
                    @authorizeWallet="$emit('authorizeWallet')"
                    @authorizeCollateral="$emit('authorizeCollateral', $event)"
                    @execute="$emit('execute', $event)"
                    @toggleAutoRouterLoad="$emit('toggleAutoRouterLoad', $event)"
                />
                <CollateralAuctionBidTransaction
                    v-if="selectedAuction && secondStep === 'purchase'"
                    class="mt-6 mb-8 mx-8"
                    :auction-transaction="selectedAuction"
                    :is-connecting="isConnecting"
                    :is-authorizing="isAuthorizing"
                    :is-depositing-or-withdrawing="isDepositingOrWithdrawing"
                    :is-executing="isExecuting"
                    :is-wallet-authorized="isWalletAuthorized"
                    :is-explanations-shown="isExplanationsShown"
                    :authorised-collaterals="authorisedCollaterals"
                    :wallet-address="walletAddress"
                    :wallet-dai="walletDai"
                    :wallet-vat-dai="walletVatDai"
                    :collateral-vat-balance="collateralVatBalance"
                    :is-fetching-collateral-vat-balance="isFetchingCollateralVatBalance"
                    @fetchCollateralVatBalance="$emit('fetchCollateralVatBalance', $event)"
                    @withdrawAllCollateralFromVat="$emit('withdrawAllCollateralFromVat', $event)"
                    @connect="$emit('connect')"
                    @disconnect="$emit('disconnect')"
                    @manageVat="$emit('manageVat')"
                    @authorizeWallet="$emit('authorizeWallet')"
                    @authorizeCollateral="$emit('authorizeCollateral', $event)"
                    @bidWithDai="$emit('bidWithDai', $event)"
                />
            </template>
        </SplitLayout>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { TakeEvent } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import SplitLayout from '~/components/layout/SplitLayout.vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import CollateralAuctionText from '~/components/auction/collateral/CollateralAuctionText.vue';
import CollateralAuction from '~/components/auction/collateral/CollateralAuction.vue';
import CollateralAuctionSwapTransaction from '~/components/auction/collateral/CollateralAuctionSwapTransaction.vue';
import CollateralAuctionBidTransaction from '~/components/auction/collateral/CollateralAuctionBidTransaction.vue';

export default Vue.extend({
    components: {
        SplitLayout,
        CollateralAuctionText,
        CollateralAuction,
        CollateralAuctionSwapTransaction,
        LandingBlock,
        CollateralAuctionBidTransaction,
    },
    props: {
        auctions: {
            type: Array as Vue.PropType<AuctionTransaction[]>,
            default: () => [],
        },
        takeEventStorage: {
            type: Object as Vue.PropType<string, TakeEvent[]>,
            default: () => ({}),
        },
        areAuctionsFetching: {
            type: Boolean,
            default: false,
        },
        isSelectedAuctionFetching: {
            type: Boolean,
            default: false,
        },
        areTakeEventsFetching: {
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
        selectedAuctionId: {
            type: String,
            default: null,
        },
        isConnecting: {
            type: Boolean,
            default: false,
        },
        isDepositingOrWithdrawing: {
            type: Boolean,
            default: false,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isExecuting: {
            type: Boolean,
            default: false,
        },
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        authorisedCollaterals: {
            type: Array as Vue.PropType<string[]>,
            default: () => [],
        },
        walletAddress: {
            type: String,
            default: null,
        },
        walletDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletVatDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        collateralVatBalanceStore: {
            type: Object as Vue.PropType<Record<string, BigNumber | undefined>>,
            default: undefined,
        },
        isFetchingCollateralVatBalance: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        lastUpdated: {
            type: Date,
            default: null,
        },
        autoroutingStates: {
            type: Object as Vue.PropType<Record<string, boolean>>,
            default: () => ({}),
        },
    },
    data: () => ({
        step: 0,
        secondStep: '',
    }),
    computed: {
        selectedAuction(): AuctionTransaction | null {
            return this.auctions.find(auctionTransaction => auctionTransaction.id === this.selectedAuctionId) || null;
        },
        selectedAuctionError(): string | null {
            return this.auctionErrors[this.selectedAuctionId] || null;
        },
        selectedTakeEvents(): TakeEvent[] | null {
            if (this.selectedAuction === null && this.takeEventStorage) {
                return this.takeEventStorage[this.selectedAuctionId] || null;
            }
            return null;
        },
        collateralVatBalance(): BigNumber | undefined {
            if (!this.collateralVatBalanceStore || !this.selectedAuction) {
                return;
            }
            return this.collateralVatBalanceStore[this.selectedAuction.collateralType];
        },
        isAutoroutingEnabled(): boolean {
            return this.autoroutingStates[this.selectedAuction.id];
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
            if (event === true && this.$refs.mainText) {
                (this.$refs.mainText as Vue).$el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
            this.$emit('update:isExplanationsShown', event);
        },
        swap() {
            this.step = 2;
            this.secondStep = 'swap';
        },
        purchase() {
            this.step = 2;
            this.secondStep = 'purchase';
        },
    },
});
</script>

<style scoped>
.MainTextContainer {
    min-height: calc(100vh - 10rem);
}
</style>
