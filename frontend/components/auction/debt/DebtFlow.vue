<template>
    <div>
        <SplitLayout :step.sync="step">
            <template #step0>
                <div v-if="isExplanationsShown" class="h-1/2">
                    <LandingBlock title="Debt auctions" @explanations="explanationsTrigger" />
                </div>
                <div class="mx-4 md:mx-0 DebtTextContainer">
                    <DebtText
                        ref="debtText"
                        :auctions="auctions"
                        :selected-auction-id="parsedSelectedAuctionId"
                        :are-auctions-fetching="areAuctionsFetching"
                        :last-updated="lastUpdated"
                        :auctions-error="auctionsError"
                        :is-explanations-shown="isExplanationsShown"
                        @selectedAuctionId:update="$emit('selectedAuctionId:update', $event)"
                    />
                </div>
            </template>
            <template #step1>
                <DebtAuction
                    class="mt-6 mb-8 mx-8"
                    :auction="selectedAuction"
                    :auction-id="parsedSelectedAuctionId"
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
                <DebtAuctionTransactionFlow
                    v-if="selectedAuction"
                    class="mt-6 mb-8 mx-8"
                    :auction="selectedAuction"
                    :auction-action-state="selectedAuctionActionState"
                    :wallet-address="walletAddress"
                    :wallet-dai="walletDai"
                    :allowance-dai="allowanceDai"
                    :wallet-vat-dai="walletVatDai"
                    :network="network"
                    :token-address="tokenAddress"
                    :is-connecting-wallet="isConnectingWallet"
                    :is-refreshing-wallet="isRefreshingWallet"
                    :is-setting-allowance="isSettingAllowance"
                    :is-depositing="isDepositing"
                    :is-explanations-shown="isExplanationsShown"
                    :is-authorizing="isAuthorizing"
                    :is-debt-auction-authorized="isDebtAuctionAuthorized"
                    @authorizeFlopper="$emit('authorizeFlopper')"
                    @connectWallet="$emit('connectWallet')"
                    @disconnectWallet="$emit('disconnectWallet')"
                    @refreshWallet="$emit('refreshWallet')"
                    @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
                    @deposit="$emit('deposit', $event)"
                    @bid="$emit('bid', $event)"
                    @collect="$emit('collect', selectedAuction.id)"
                />
            </template>
        </SplitLayout>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { CompensationAuctionActionStates, DebtAuctionTransaction, WalletBalances } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import DebtAuction from '~/components/auction/debt/DebtAuction.vue';
import DebtAuctionTransactionFlow from '~/components/auction/debt/DebtAuctionTransactionFlow.vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import SplitLayout from '~/components/layout/SplitLayout.vue';
import DebtText from '~/components/auction/debt/DebtText.vue';

export default Vue.extend({
    components: {
        DebtAuctionTransactionFlow,
        DebtAuction,
        LandingBlock,
        SplitLayout,
        DebtText,
    },
    props: {
        auctions: {
            type: Array as Vue.PropType<DebtAuctionTransaction[]>,
            default: () => [],
        },
        selectedAuctionId: {
            type: String,
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
        allowanceDai: {
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
        isDepositing: {
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
            type: Object as Vue.PropType<string, CompensationAuctionActionStates>,
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
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isDebtAuctionAuthorized: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        step: 0,
        secondStep: '',
    }),
    computed: {
        parsedSelectedAuctionId(): number | undefined {
            return parseInt(this.selectedAuctionId) || undefined;
        },
        selectedAuction(): DebtAuctionTransaction | undefined {
            return (
                this.auctions.find(
                    auctionTransaction => auctionTransaction.id === parseInt(this.parsedSelectedAuctionId)
                ) || undefined
            );
        },
        selectedAuctionError(): string | undefined {
            return this.auctionErrors[this.selectedAuctionId] || undefined;
        },
        selectedAuctionActionState(): string | undefined {
            return this.auctionActionState[this.selectedAuctionId] || undefined;
        },
        walletDai(): BigNumber | undefined {
            return this.walletBalances?.walletDAI || undefined;
        },
        walletVatDai(): BigNumber | undefined {
            return this.walletBalances?.walletVatDAI || undefined;
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
            if (event === true && this.$refs.debtText) {
                (this.$refs.debtText as Vue).$el.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
.DebtTextContainer {
    min-height: calc(100vh - 10rem);
}
</style>
