<template>
    <TextBlock :title="`Auction #${auctionId}`">
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
                            <td>Auction Ends</td>
                            <td>
                                <TimeTill :date="auction.endDate" />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Amount</td>
                            <td>
                                <format-currency :value="auction.collateralAmount" :currency="auction.tokenName" />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Price</td>
                            <td>
                                <template v-if="auction.isActive">
                                    <format-currency :value="auction.approximateUnitPrice" currency="DAI" />
                                    per
                                    <format-currency :currency="auction.tokenName" />
                                    <PriceDropAnimation :auction="auction" />
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Price On Uniswap</td>
                            <td>
                                <template v-if="auction.isActive && auction.marketUnitPrice">
                                    <format-currency :value="auction.marketUnitPrice" currency="DAI" /> per
                                    <format-currency :currency="auction.tokenName" />
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
                            <td>Estimated Profitability Time</td>
                            <td>
                                <TimeTillProfitable :auction="auction" />
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
                        <template v-if="isTableExpanded">
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Vault type</td>
                                <td>
                                    <format-currency :currency="auction.collateralType" />
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Auction Debt</td>
                                <td>
                                    <format-currency :value="auction.debtDAI" currency="DAI" />
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Collateral amount to cover Debt</td>
                                <td>
                                    <Popover
                                        v-if="!auction.isActive && !auction.isFinished"
                                        placement="top"
                                        content="Can not be computed since the auction is not active"
                                        trigger="hover"
                                    >
                                        <span class="opacity-50">Unknown</span>
                                    </Popover>
                                    <format-currency
                                        v-else
                                        :value="auction.collateralToCoverDebt"
                                        :currency="auction.tokenName"
                                    />
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Vault address</td>
                                <td>
                                    <format-address :value="auction.vaultAddress" disable />
                                </td>
                            </tr>
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
                        The auctioned vault
                        <format-address type="address" :value="auction.vaultAddress" shorten disable /> contains
                        <format-currency :value="auction.collateralAmount" :currency="auction.tokenName" />.
                        <span v-if="auction.isActive || auction.isFinished">
                            Currently, it is sold for <format-currency :value="auction.totalPrice" currency="DAI" />.
                            This equals <format-currency :value="auction.approximateUnitPrice" currency="DAI" /> per
                            <format-currency :currency="auction.tokenName" />, or approximately
                            <format-market-value :value="auction.marketUnitPriceToUnitPriceRatio" /> than if you buy
                            <format-currency :currency="auction.tokenName" /> on another exchange platform such as
                            Uniswap.
                        </span>
                        <span v-else>
                            This auction requires to be restarted in order to determine prices properly.
                        </span>
                    </template>
                    <template v-else>
                        This auction was finished at {{ auction.endDate.toUTCString() }} at a closing auction price of
                        <format-currency :value="auction.approximateUnitPrice" currency="DAI" /> (meaning
                        <format-currency :value="auction.approximateUnitPrice" currency="DAI" />
                        per <format-currency :currency="auction.tokenName" /> on average) after
                        <TimeTill :date="auction.endDate" />.
                    </template>
                </TextBlock>

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
                                Bid with DAI
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
        <CollateralAuctionEventsBlock v-else-if="takeEvents && takeEvents.length > 0" :take-events="takeEvents" />
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
import PriceDropAnimation from './PriceDropAnimation.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import Button from '~/components/common/inputs/BaseButton.vue';
import FormatMarketValue from '~/components/common/formatters/FormatMarketValue.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import Loading from '~/components/common/other/Loading.vue';
import Explain from '~/components/common/other/Explain.vue';
import TimeTillProfitable from '~/components/auction/collateral/TimeTillProfitable.vue';
import CollateralAuctionEventsBlock from '~/components/auction/collateral/CollateralAuctionEventsBlock.vue';
import AuctionRestartPanel from '~/components/panels/AuctionRestartPanel.vue';
import LoadingIcon from '~/assets/icons/loading.svg';

export default Vue.extend({
    name: 'CollateralAuction',
    components: {
        AuctionRestartPanel,
        CollateralAuctionEventsBlock,
        PriceDropAnimation,
        Explain,
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
                because we can't get value of ${this.auction?.tokenName} on UniSwap`;
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
