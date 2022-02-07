<template>
    <TextBlock :title="`Auction #${auctionId}`">
        <Alert v-if="errorText" class="my-3" :message="errorText" type="error" />
        <div v-if="auction">
            <RestartBlock
                v-if="errorText === 'This auction is inactive and must be restarted'"
                :transaction-fee="auction.restartTransactionFeeETH"
                :is-explanations-shown="isExplanationsShown"
                :wallet-address="walletAddress"
                :is-restarting="auction.isRestarting"
                @restart="$emit('restart', auctionId)"
            />
            <div class="relative mt-4">
                <table class="w-full table-fixed border-collapse border">
                    <tbody>
                        <tr>
                            <td>Auction Ends</td>
                            <td>
                                <time-till :date="auction.endDate" />
                            </td>
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
                            <td>Auction Price</td>
                            <td>
                                <template v-if="auction.isActive">
                                    <format-currency :value="auction.approximateUnitPrice" currency="DAI" />
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
                                    <format-currency :value="auction.marketUnitPrice" currency="DAI" /> per
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
                                <span v-else class="opacity-50">Not tradable</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Estimated Profitability Time</td>
                            <td>
                                <time-till-profitable :auction="auction" />
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
                                <td>Auction Price Total</td>
                                <td>
                                    <format-currency
                                        v-if="auction.isActive"
                                        :value="auction.totalPrice"
                                        currency="DAI"
                                    />
                                    <Popover
                                        v-else
                                        placement="top"
                                        content="Since the auction is not active, there is no total Auction Price for this auction."
                                        trigger="hover"
                                    >
                                        <span class="opacity-50">Unknown</span>
                                    </Popover>
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Debt</td>
                                <td>
                                    <format-currency :value="auction.debtDAI" currency="DAI" />
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
                                        {{ new Date(auction.startDate).toUTCString() }}
                                    </template>
                                    <span v-else class="opacity-50">Unknown</span>
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Auction End</td>
                                <td>
                                    <template v-if="auction.isActive">
                                        {{ new Date(auction.endDate).toUTCString() }}
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
                        <format-currency :value="auction.collateralAmount" :currency="auction.collateralSymbol" />.
                        Currently, it is sold for <format-currency :value="auction.totalPrice" currency="DAI" />. This
                        equals <format-currency :value="auction.approximateUnitPrice" currency="DAI" /> per
                        <format-currency :currency="auction.collateralSymbol" />, or approximately
                        <format-market-value :value="auction.marketUnitPriceToUnitPriceRatio" /> than if you buy
                        <format-currency :currency="auction.collateralSymbol" /> on another exchange platform such as
                        Uniswap.
                    </template>
                    <template v-else>
                        This auction was finished at {{ auction.endDate.toUTCString() }} at a closing auction price of
                        <format-currency :value="auction.approximateUnitPrice" currency="DAI" /> (meaning
                        <format-currency :value="auction.approximateUnitPrice" currency="DAI" />
                        per <format-currency :currency="auction.collateralSymbol" /> on average) after
                        <time-till :date="auction.endDate" />.
                    </template>
                </TextBlock>

                <TextBlock title="Different ways to bid" class="TextBlock mt-8">
                    There are two ways to participate in an auction:
                    <ul class="list-disc list-outside pl-5">
                        <li>
                            Bid with DAI: This allows the participant to manually bid DAI on the auctioned collateral
                            and redeem the auctioned collateral. This transaction type is not yet supported. In the
                            meantime, you can use
                            <a href="https://liquidations.makerdao.com/" target="_blank">Liquidation Portal</a>
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
                    <Tooltip placement="top">
                        <div slot="title">
                            This website does not yet support bidding on the auction with your own DAI. In the
                            meantime, you can use
                            <a href="https://liquidations.makerdao.com/" target="_blank" class="underline text-primary"
                                >Liquidation Portal</a
                            >
                        </div>
                        <div>
                            <Button disabled type="secondary" class="w-60 mb-4" @click="$emit('purchase')">
                                Bid with DAI
                            </Button>
                        </div>
                    </Tooltip>
                    <Tooltip :title="errorText" placement="bottom">
                        <div>
                            <Button :disabled="!!errorText" type="primary" class="w-60 ml-4" @click="$emit('swap')">
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
        <Loading v-else-if="isAuctionsLoading" is-loading class="w-full self-center Loading h-48" />
    </TextBlock>
</template>

<script lang="ts">
import type { AuctionTransaction } from 'auctions-core/src/types';
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
import Explain from '~/components/utils/Explain.vue';
import RestartBlock from '~/components/transaction/RestartBlock.vue';
import TimeTillProfitable from '~/components/utils/TimeTillProfitable.vue';

export default Vue.extend({
    name: 'Auction',
    components: {
        PriceDropAnimation,
        RestartBlock,
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
        error: {
            type: String,
            default: '',
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isAuctionsLoading: {
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
        errorText(): string | null {
            if (!this.isAuctionsLoading && !this.auction) {
                return 'This auction was not found';
            } else if (this.error) {
                return this.error;
            } else if (this.auction?.isFinished) {
                return 'This auction is finished';
            } else if (!this.auction?.isActive && !this.isAuctionsLoading) {
                return 'This auction is inactive and must be restarted';
            } else if (
                !this.isAuctionsLoading &&
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
