<template>
    <TextBlock :title="`Surplus auction #${auctionId}`">
        <div class="my-3">
            <Alert v-if="auctionError && auctionError.showBanner" :message="auctionError.error" type="error" />
        </div>
        <div v-if="auction">
            <div v-if="!auction.isActive">
                <AuctionRestartPanel
                    :wallet-address="walletAddress"
                    :transaction-fee="auction.restartTransactionFeeETH"
                    :is-explanations-shown="isExplanationsShown"
                    :is-restarting="auction.isRestarting"
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
                            <td>Ends in <time-till :date="auction.endDate" /></td>
                        </tr>
                        <tr>
                            <td>Auction Amount</td>
                            <td>
                                <format-currency
                                    :value="auction.collateralAmount"
                                    :currency="auction.collateralSymbol"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Highest Bid</td>
                            <td>
                                <format-currency :value="auction.approximateUnitPrice" :currency="MKR" />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Price</td>
                            <td>
                                <template v-if="auction.isActive">
                                    <format-currency :value="auction.approximateUnitPrice" currency="MKR" />
                                    per
                                    <format-currency :currency="auction.collateralSymbol" />
                                    <PriceDropAnimation :auction="auction" />
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Price On Uniswap</td>
                            <td>
                                <template v-if="auction.isActive && auction.marketUnitPrice">
                                    <format-currency :value="auction.marketUnitPrice" currency="MKR" /> per
                                    <format-currency :currency="auction.collateralSymbol" />
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Market Difference</td>
                            <td>
                                <template v-if="auction.isActive && auction.marketUnitPriceToUnitPriceRatio">
                                    <format-market-value :value="auction.marketUnitPriceToUnitPriceRatio" />
                                </template>
                                <span
                                    v-else-if="
                                        auction.isActive &&
                                        !auction.marketUnitPriceToUnitPriceRatio &&
                                        !auction.isFinished
                                    "
                                    class="opacity-50"
                                >
                                    Not tradable
                                </span>
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
                        <template v-if="isTableExpanded">
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Estimated Profitability Time</td>
                                <td>
                                    <time-till-profitable :auction="auction" />
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Auction Price Total</td>
                                <td>
                                    <Popover
                                        v-if="!auction.isActive && !auction.isFinished"
                                        placement="top"
                                        content="Since the auction is not active, there is no total Auction Price for this auction."
                                        trigger="hover"
                                    >
                                        <span class="opacity-50">Unknown</span>
                                    </Popover>
                                    <format-currency v-else :value="auction.totalPrice" currency="MKR" />
                                </td>
                            </tr>
                            <!-- Unsure whether to remove this or not, so I commented it out

                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Debt</td>
                                <td>
                                    <format-currency :value="auction.debtDAI" currency="DAI" />
                                </td>
                            </tr>

                            -->
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Auction Start</td>
                                <td>
                                    <template v-if="auction.isActive">
                                        {{ auction.startDate.toUTCString() }}
                                    </template>
                                    <span v-else class="opacity-50">Unknown</span>
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Auction End</td>
                                <td>
                                    <template v-if="auction.isActive">
                                        {{ auction.endDate.toUTCString() }}
                                    </template>
                                    <span v-else class="opacity-50">Unknown</span>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div v-if="error" class="Disable" />
            </div>
            <button
                class="
                    w-full
                    border-2 border-gray-300
                    p-1
                    border-t-0
                    text-center text-gray-400
                    dark:border-gray-600 dark:text-gray-600
                "
                @click="toggleExpandable"
            >
                {{ isTableExpanded ? 'Hide additional info' : 'Show additional info' }}
            </button>
            <template v-if="isExplanationsShown">
                <TextBlock class="mt-4">
                    <template v-if="!error">
                        The auctioned surplus auction contains
                        <format-currency :value="auction.collateralAmount" :currency="auction.collateralSymbol" />.
                        <span v-if="auction.isActive || auction.isFinished">
                            The highest bid for it is
                            <format-currency :value="auction.approximateUnitPrice" currency="MKR" />. This equals
                            <format-currency :value="auction.approximateUnitPrice" currency="MKR" /> per
                            <format-currency :currency="auction.collateralSymbol" />, or approximately
                            <format-market-value :value="auction.marketUnitPriceToUnitPriceRatio" /> than if you buy
                            <format-currency :currency="auction.collateralSymbol" /> on another exchange platform such
                            as Uniswap.
                        </span>
                        <span v-else>
                            This auction requires to be restarted in order to determine prices properly.
                        </span>
                    </template>
                    <template v-else>
                        This auction was finished at {{ auction.endDate.toUTCString() }} at a closing auction price of
                        <format-currency :value="auction.approximateUnitPrice" currency="MKR" />.
                    </template>
                </TextBlock>

                <!-- Unsure whether to remove/modify this or not, so I commented it out as well
                
                <TextBlock title="Different ways to bid" class="TextBlock mt-8">
                    There are two ways to participate in an auction:
                    <ul class="list-disc list-outside pl-5">
                        <li>
                            Bid with DAI: This allows the participant to manually bid DAI on the auctioned collateral
                            and redeem the auctioned collateral. (In case you want to participate in this auction via
                            the old liquidation UI, you can use the
                            <a href="https://legacyliquidations.vercel.app/" target="_blank" class="inline-block">
                                Legacy Liquidation Portal </a
                            >. However, be aware that this UI is no longer actively maintained.)
                        </li>
                        <li>
                            Directly swap into profit: The auctioned collateral is bought and sold on an available
                            marketplace in exchange for DAI in a single transaction. You will receive the resulting
                            profit. In the Maker community this is known as a
                            <Explain text="flash loan">
                                <a
                                    href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#flash-lending-of-collateral"
                                    target="_blank"
                                >
                                    Flash lending of collateral
                                </a>
                                enables even a participant with zero DAI (and nothing to trade for DAI) to purchase
                                from an auction by directing the sale of the auction's collateral into other protocols
                                in exchange for DAI. </Explain
                            >.
                        </li>
                    </ul>
                </TextBlock>

                -->
            </template>
            <TextBlock>
                <div class="flex w-full justify-end flex-wrap mt-4">
                    <Tooltip :title="auctionError && auctionError.error" placement="top">
                        <div>
                            <Button
                                :disabled="!!auctionError"
                                type="secondary"
                                class="w-60 mb-4"
                                @click="$emit('purchase')"
                            >
                                Bid using MKR
                            </Button>
                        </div>
                    </Tooltip>
                    <Tooltip :title="swapTransactionError" placement="bottom">
                        <div>
                            <Button
                                :disabled="!!swapTransactionError"
                                type="primary"
                                class="w-60 ml-4"
                                @click="$emit('swap')"
                            >
                                Directly swap into profit
                            </Button>
                        </div>
                    </Tooltip>
                </div>
                <div v-if="auction.transactionAddress" class="flex w-full justify-end">
                    <span>
                        Transaction <format-address shorten :value="auction.transactionAddress" /> was successfully
                        executed.
                        <format-address explicit :value="auction.transactionAddress" />
                    </span>
                </div>
            </TextBlock>
        </div>
        <AuctionEventsBlock v-else-if="takeEvents && takeEvents.length > 0" :take-events="takeEvents" />
        <Loading
            v-else-if="areAuctionsFetching || areTakeEventsFetching"
            is-loading
            class="w-full self-center Loading h-48"
        />
    </TextBlock>
</template>

<script lang="ts">
import type { AuctionTransaction, TakeEvent } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert, Tooltip, Popover } from 'ant-design-vue';
import PriceDropAnimation from './utils/PriceDropAnimation.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import TimeTill from '~/components/common/TimeTill.vue';
import Button from '~/components/common/BaseButton.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import Loading from '~/components/common/Loading.vue';
// import Explain from '~/components/utils/Explain.vue';
import TimeTillProfitable from '~/components/utils/TimeTillProfitable.vue';
import AuctionEventsBlock from '~/components/AuctionEventsBlock.vue';
import AuctionRestartPanel from '~/components/panels/AuctionRestartPanel.vue';
import LoadingIcon from '~/assets/icons/loading.svg';

export default Vue.extend({
    name: 'SurplusAuction',
    components: {
        AuctionRestartPanel,
        AuctionEventsBlock,
        PriceDropAnimation,
        // Explain,
        Loading,
        FormatCurrency,
        TextBlock,
        TimeTill,
        Button,
        FormatMarketValue,
        FormatAddress,
        Alert,
        Tooltip,
        TimeTillProfitable,
        Popover,
        LoadingIcon,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            default: null,
        },
        auctionId: {
            type: String,
            required: true,
        },
        takeEvents: {
            type: Array as Vue.PropType<TakeEvent[]>,
            default: null,
        },
        error: {
            type: String,
            default: '',
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        areAuctionsFetching: {
            type: Boolean,
            default: false,
        },
        areTakeEventsFetching: {
            type: Boolean,
            default: false,
        },
        walletAddress: {
            type: String,
            default: null,
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
            } else if (!this.areAuctionsFetching && !this.areTakeEventsFetching && !this.auction && !this.takeEvents) {
                return {
                    error: 'This auction was not found',
                    showBanner: true,
                };
            } else if (this.auction?.isFinished || (!this.auction && this.takeEvents)) {
                return {
                    error: 'This auction is finished',
                    showBanner: true,
                };
            } else if (!this.auction?.isActive && !this.areAuctionsFetching && !this.areTakeEventsFetching) {
                return {
                    error: 'This auction is inactive and must be restarted',
                    showBanner: false,
                };
            }
            return null;
        },
        swapTransactionError(): string | null {
            if (this.auctionError) {
                return this.auctionError.error;
            }
            if (
                !this.areAuctionsFetching &&
                !this.areTakeEventsFetching &&
                typeof this.auction?.marketUnitPriceToUnitPriceRatio === 'undefined'
            ) {
                return `Swap transaction is not possible,
                because we can't get value of ${this.auction?.collateralSymbol} on UniSwap`;
            }
            return null;
        },
    },
    watch: {
        isExplanationsShown: {
            immediate: true,
            handler(newIsExplanationsShown) {
                if (!newIsExplanationsShown) {
                    this.isTableExpanded = true;
                }
            },
        },
        areAuctionsFetching(areAuctionsFetching) {
            if (!areAuctionsFetching && !this.auction && !this.error) {
                this.$emit('fetchTakeEventsFromAuction', this.auctionId);
            }
        },
    },
    methods: {
        toggleExpandable(): void {
            this.isTableExpanded = !this.isTableExpanded;
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
