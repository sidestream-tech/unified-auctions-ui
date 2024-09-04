<template>
    <TextBlock :title="`Debt auction #${auctionId}`">
        <div class="my-3">
            <Alert v-if="auctionError && auctionError.showBanner" :message="auctionError.error" type="error" />
            <Alert
                v-if="auction && auction.state === 'ready-for-collection'"
                message="This auction has ended and is ready for collection"
                type="info"
            />
        </div>
        <div v-if="auction">
            <div v-if="requiresRestart">
                <AuctionRestartPanel
                    :wallet-address="walletAddress"
                    :is-explanations-shown="isExplanationsShown"
                    :is-restarting="auctionActionState === 'restarting'"
                    :is-connecting="isConnecting"
                    auction-type="compensation"
                    @restart="$emit('restart', auctionId)"
                    @connectWallet="$emit('connect')"
                    @disconnectWallet="$emit('disconnect')"
                />
            </div>
            <div class="relative mt-2">
                <table class="w-full table-fixed border-collapse border">
                    <tbody>
                        <tr>
                            <td>Auction State</td>
                            <td>
                                <span v-if="isActive">Ends in </span>
                                <span v-else-if="requiresRestart">Requires restart</span>
                                <span v-else-if="auction.state === 'ready-for-collection'">Ended </span>
                                <span v-else>Collected </span>
                                <TimeTill
                                    v-if="auction.earliestEndDate && !requiresRestart"
                                    :date="auction.earliestEndDate"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Fixed Bid</td>
                            <td>
                                <format-currency :value="auction.bidAmountDai" currency="DAI" />
                            </td>
                        </tr>
                        <tr>
                            <td>Current Compensation</td>
                            <td v-if="withBids">
                                <format-currency :value="auction.receiveAmountMKR" currency="MKR" />
                            </td>
                            <td v-else>
                                <span class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Price</td>
                            <td>
                                <template v-if="withBids">
                                    <format-currency :value="auction.unitPrice" :decimal-places="6" currency="DAI" />
                                    per <format-currency currency="MKR" />
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Price On Uniswap</td>
                            <td>
                                <template v-if="auction.marketUnitPrice">
                                    <format-currency
                                        :value="auction.marketUnitPrice"
                                        :decimal-places="6"
                                        currency="DAI"
                                    />
                                    per
                                    <format-currency currency="MKR" />
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Market Difference</td>
                            <td>
                                <template
                                    v-if="
                                        auction.marketUnitPriceToUnitPriceRatio &&
                                        !auction.marketUnitPriceToUnitPriceRatio.isNaN()
                                    "
                                >
                                    <format-market-value :value="auction.marketUnitPriceToUnitPriceRatio" />
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Last updated</td>
                            <td>
                                <div v-if="areAuctionsFetching" class="flex items-center space-x-2">
                                    <LoadingIcon
                                        class="h-4 w-4 animate animate-spin fill-current dark:text-gray-300"
                                    />
                                    <span>Updating...</span>
                                </div>
                                <TimeTill v-else :date="auction.fetchedAt" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="error" class="Disable" />
            </div>
            <template v-if="isExplanationsShown">
                <TextBlock class="mt-4">
                    <template v-if="error !== 'This auction is finished'">
                        The debt auction requires you to bid
                        <format-currency :value="auction.bidAmountDai" currency="DAI" />.
                        <span v-if="requiresRestart">
                            This auction requires to be restarted in order to determine its prices.
                        </span>
                        <span v-else>
                            The latest bid asks for
                            <format-currency :value="auction.receiveAmountMKR" currency="MKR" /> compensation to
                            receive in return. This equals to
                            <format-currency :value="auction.unitPrice" currency="DAI" />
                            per <format-currency currency="MKR" />, or approximately
                            <format-market-value :value="auction.marketUnitPriceToUnitPriceRatio" /> market than if you
                            exchange <format-currency currency="DAI" /> to <format-currency currency="MKR" /> on an
                            exchange platform such as Uniswap.
                        </span>
                    </template>
                    <template v-else> This auction has finished and the earnings have been collected. </template>
                </TextBlock>
            </template>
            <TextBlock>
                <div class="flex w-full justify-end flex-wrap mt-4">
                    <Tooltip :title="auctionError && auctionError.error" placement="top">
                        <div>
                            <Button :disabled="!!auctionError" type="primary" class="w-60 mb-4" @click="$emit('bid')">
                                {{ auction.state === 'ready-for-collection' ? 'Collect earnings' : 'Bid using DAI' }}
                            </Button>
                        </div>
                    </Tooltip>
                </div>
            </TextBlock>
        </div>
        <Loading v-else-if="areAuctionsFetching" is-loading class="w-full self-center Loading h-48" />
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import type { CompensationAuctionActionStates, DebtAuctionTransaction } from 'auctions-core/src/types';
import { Alert, Tooltip } from 'ant-design-vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import Button from '~/components/common/inputs/BaseButton.vue';
import FormatMarketValue from '~/components/common/formatters/FormatMarketValue.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import AuctionRestartPanel from '~/components/panels/AuctionRestartPanel.vue';
import LoadingIcon from '~/assets/icons/loading.svg';
import Loading from '~/components/common/other/Loading.vue';

export default Vue.extend({
    name: 'DebtAuction',
    components: {
        AuctionRestartPanel,
        FormatCurrency,
        TextBlock,
        TimeTill,
        Button,
        FormatMarketValue,
        Alert,
        Tooltip,
        LoadingIcon,
        Loading,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<DebtAuctionTransaction>,
            default: null,
        },
        auctionId: {
            type: Number,
            default: null,
        },
        auctionActionState: {
            type: String as Vue.PropType<CompensationAuctionActionStates>,
            default: null,
        },
        error: {
            type: String,
            default: null,
        },
        isConnecting: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        areAuctionsFetching: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isTableExpanded: false,
        };
    },
    computed: {
        auctionError(): { error: string; showBanner: boolean } | null {
            if (this.error) {
                return {
                    error: this.error,
                    showBanner: true,
                };
            } else if (!this.auction && !this.areAuctionsFetching) {
                return {
                    error: 'This auction was not found',
                    showBanner: true,
                };
            } else if (this.auction?.state === 'collected') {
                return {
                    error: 'This auction was collected',
                    showBanner: true,
                };
            } else if (this.auction?.state === 'requires-restart' && !this.areAuctionsFetching) {
                return {
                    error: 'This auction is inactive and must be restarted',
                    showBanner: false,
                };
            }
            return null;
        },
        isActive(): boolean {
            return this.auction.state === 'just-started' || this.auction.state === 'have-bids';
        },
        requiresRestart(): boolean {
            return this.auction.state === 'requires-restart';
        },
        withBids(): boolean {
            return this.auction.bidAmountDai && !this.auction.bidAmountDai.isEqualTo(0);
        },
    },
});
</script>

<style scoped>
th,
td {
    @apply p-2 border-2 border-collapse border-gray-300 dark:border-gray-600 dark:text-gray-200;
}
.Disable {
    @apply absolute inset-0 bg-gray-700 opacity-70;
}
</style>
