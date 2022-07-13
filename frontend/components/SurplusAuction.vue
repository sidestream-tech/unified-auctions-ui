<template>
    <TextBlock :title="`Surplus auction #${auctionId}`">
        <div class="my-3">
            <Alert v-if="auctionError && auctionError.showBanner" :message="auctionError.error" type="error" />
        </div>
        <div v-if="auction">
            <div v-if="requiresRestart">
                <AuctionRestartPanel
                    :wallet-address="walletAddress"
                    :is-explanations-shown="isExplanationsShown"
                    :is-restarting="auction.isRestarting"
                    auction-type="surplus"
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
                                <time-till v-if="auction.earliestEndDate" :date="auction.earliestEndDate" />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Amount</td>
                            <td>
                                <format-currency :value="auction.receiveAmountDAI" currency="DAI" />
                            </td>
                        </tr>
                        <tr>
                            <td>Highest Bid</td>
                            <td v-if="withBids">
                                <format-currency :value="auction.bidAmountMKR" currency="MKR" />
                            </td>
                            <td v-else>
                                <span class="opacity-50">No bids yet</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Price</td>
                            <td>
                                <template v-if="withBids">
                                    <format-currency :value="unitPrice" currency="MKR" />
                                    per <format-currency currency="DAI" />
                                </template>
                                <span v-else class="opacity-50">No bids yet</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Price On Uniswap</td>
                            <td>
                                <template v-if="isActive && auction.marketUnitPrice">
                                    <format-currency :value="auction.marketUnitPrice" currency="MKR" /> per
                                    <format-currency currency="DAI" />
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Market Difference</td>
                            <td>
                                <template v-if="isActive && auction.marketUnitPriceToUnitPriceRatio">
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
                                <time-till v-else :date="auction.fetchedAt" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="error" class="Disable" />
            </div>
            <template v-if="isExplanationsShown">
                <TextBlock class="mt-4">
                    <template v-if="error !== 'This auction is finished'">
                        The auctioned surplus auction contains
                        <format-currency :value="auction.receiveAmountDAI" currency="DAI" />.
                        <span v-if="requiresRestart">
                            This auction requires to be restarted in order to determine prices properly.
                        </span>
                        <span v-else>
                            The highest bid for it is
                            <format-currency :value="auction.bidAmountMKR" currency="MKR" />. This equals
                            <format-currency :value="unitPrice" currency="MKR" />
                            per <format-currency currency="DAI" />, or approximately
                            <format-market-value :value="auction.marketUnitPriceToUnitPriceRatio" /> than if you
                            exchange <format-currency currency="MKR" /> to <format-currency currency="DAI" /> on an
                            exchange platform such as Uniswap.
                        </span>
                    </template>
                    <template v-else>
                        <!-- Issue: We dont have bidAmountMKR and auctionEndTime when an Auction is finished, therefore we need to reword this text -->
                        This auction was finished at a closing auction price of
                        <format-currency :value="auction.bidAmountMKR" currency="MKR" />.
                    </template>
                </TextBlock>
            </template>
            <TextBlock>
                <div class="flex w-full justify-end flex-wrap mt-4">
                    <Tooltip :title="auctionError && auctionError.error" placement="top">
                        <div>
                            <Button
                                :disabled="!!auctionError"
                                type="secondary"
                                class="w-60 mb-4"
                                @click="$emit('bid')"
                            >
                                Bid using MKR
                            </Button>
                        </div>
                    </Tooltip>
                </div>
            </TextBlock>
        </div>
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import type { SurplusAuction } from 'auctions-core/src/types';
import { Alert, Tooltip } from 'ant-design-vue';
import TextBlock from '~/components/common/TextBlock.vue';
import TimeTill from '~/components/common/TimeTill.vue';
import Button from '~/components/common/BaseButton.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import AuctionRestartPanel from '~/components/panels/AuctionRestartPanel.vue';
import LoadingIcon from '~/assets/icons/loading.svg';
export default Vue.extend({
    name: 'SurplusAuction',
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
    },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuction>,
            default: null,
        },
        auctionId: {
            type: String,
            required: true,
        },
        error: {
            type: String,
            default: null,
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
            } else if (this.auction.state === 'ready-for-collection' || this.auction.state === 'collected') {
                return {
                    error: 'This auction is finished',
                    showBanner: true,
                };
            } else if (this.auction.state === 'requires-restart' && !this.areAuctionsFetching) {
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
        isFinished(): boolean {
            return this.auction.state === 'ready-for-collection' || this.auction.state === 'collected';
        },
        unitPrice(): BigNumber {
            return this.auction.bidAmountMKR.dividedBy(this.auction.receiveAmountDAI);
        },
        withBids(): boolean {
            return this.auction.bidAmountMKR && !this.auction.bidAmountMKR.isEqualTo(0);
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
