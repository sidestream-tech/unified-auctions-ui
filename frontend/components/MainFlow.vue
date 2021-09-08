<template>
    <div class="SplitLayoutContainer">
        <SplitLayout :step.sync="step">
            <template #step0>
                <MainText
                    :auctions="auctions"
                    :auctions-error="auctionsError"
                    :is-auctions-loading="isAuctionsLoading"
                    :selected-auction-id="selectedAuctionId"
                    @selectedAuctionId:update="$emit('selectedAuctionId:update', $event)"
                />
            </template>
            <template #step1>
                <div>
                    <Auction v-if="selectedAuction" class="m-10" :auction="selectedAuction" @swap="step = 2" />
                    <Alert v-else-if="step === 1" class="m-8" message="This Auction was not found" type="error" />
                </div>
            </template>
            <template #step2
                ><SwapTransaction
                    v-if="selectedAuction"
                    class="m-10"
                    :auction-transaction="selectedAuction"
                    :is-connecting="isConnecting"
                    :is-authorizing="isAuthorizing"
                    :is-authorised="isAuthorised"
                    :is-executing="isExecuting"
                    :wallet-address="walletAddress"
                    :transaction-address="transactionAddress"
                    @connect="$emit('connect')"
                    @disconnect="$emit('disconnect')"
                    @authorize="$emit('authorize')"
                    @execute="$emit('execute')"
            /></template>
        </SplitLayout>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import SplitLayout from '~/components/layout/SplitLayout.vue';
import MainText from '~/components/MainText.vue';
import Auction from '~/components/Auction.vue';
import SwapTransaction from '~/components/transaction/SwapTransaction.vue';

export default Vue.extend({
    components: { SplitLayout, MainText, Auction, SwapTransaction, Alert },
    props: {
        auctions: {
            type: Array as Vue.PropType<AuctionTransaction[]>,
            default: () => [],
        },
        isAuctionsLoading: {
            type: Boolean,
            default: false,
        },
        auctionsError: {
            type: String,
            default: null,
        },
        selectedAuctionId: {
            type: String,
            default: null,
        },
        isConnecting: {
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
        isAuthorised: {
            type: Boolean,
            default: false,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        transactionAddress: {
            type: String,
            default: null,
        },
    },
    data: () => ({
        step: 0,
    }),
    computed: {
        selectedAuction(): AuctionTransaction | null {
            return this.auctions.find(auctionTransaction => auctionTransaction.id === this.selectedAuctionId) || null;
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
});
</script>

<style scoped>
.SplitLayoutContainer {
    height: calc(100vh - 4rem);
}
</style>
