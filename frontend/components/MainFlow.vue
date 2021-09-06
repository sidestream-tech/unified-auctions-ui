<template>
    <div class="h-screen w-full">
        <SplitLayout :step.sync="step">
            <template #step0>
                <MainText
                    :auctions="auctions"
                    :selected-auction-id="selectedAuctionId"
                    @selectedAuctionId:update="$emit('selectedAuctionId:update', $event)"
                />
            </template>
            <template #step1
                ><Auction v-if="selectedAuction" class="p-8" :auction="selectedAuction" @swap="step = 2" />
                <Alert v-else class="mx-10" message="This Auction was not found" type="error" />
            </template>
            <template #step2
                ><SwapTransaction v-if="selectedAuction" class="p-8" :auction-transaction="selectedAuction"
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
        selectedAuctionId: {
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
