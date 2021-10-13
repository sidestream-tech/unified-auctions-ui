<template>
    <TextBlock :title="`Auction #${auctionId}`">
        <Alert v-if="errorText" :message="errorText" type="error" />
        <div v-if="auction">
            <div class="relative mt-4">
                <table class="w-full table-fixed border-collapse border">
                    <tbody>
                        <tr>
                            <td>Auction Ends</td>
                            <td>
                                <time-till :date="auction.till" />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Amount</td>
                            <td>
                                <format-currency :value="auction.amountRAW" :currency="auction.collateralSymbol" />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Price</td>
                            <td>
                                <format-currency :value="auction.amountPerCollateral" currency="DAI" />
                                per
                                <format-currency :currency="auction.collateralSymbol" />
                            </td>
                        </tr>
                        <tr>
                            <td>Price On Uniswap</td>
                            <td>
                                <format-currency :value="auction.marketPricePerCollateral" currency="DAI" /> per
                                <format-currency :currency="auction.collateralSymbol" />
                            </td>
                        </tr>
                        <tr>
                            <td>Market Difference</td>
                            <td><format-market-value :value="auction.marketValue" /></td>
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
                                    <format-currency :value="auction.amountDAI" currency="DAI" />
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Vault Owner</td>
                                <td>
                                    <format-address :value="auction.vaultOwner" />
                                    <format-address explicit :value="auction.vaultOwner" />
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Auction Ends At</td>
                                <td>{{ new Date(auction.till).toUTCString() }}</td>
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
                {{ isTableExpanded ? 'Hide additional numbers' : 'Show additional numbers' }}
            </button>
            <template v-if="isExplanationsShown">
                <TextBlock class="mt-4">
                    <template v-if="!error">
                        The auctioned vault <format-address shorten :value="auction.vaultOwner" /> contains
                        <format-currency :value="auction.amountRAW" :currency="auction.collateralSymbol" />. Currently,
                        it is sold for <format-currency :value="auction.amountDAI" currency="DAI" />. This equals
                        <format-currency :value="auction.amountPerCollateral" currency="DAI" /> per
                        <format-currency :currency="auction.collateralSymbol" />, or approximately
                        <format-market-value :value="auction.marketValue" /> than if you buy
                        <format-currency :currency="auction.collateralSymbol" /> on another exchange platform such as
                        Uniswap.
                    </template>
                    <template v-else>
                        This auction was finished at {{ new Date(auction.till).toUTCString() }} at a closing auction
                        price of <format-currency :value="auction.amountPerCollateral" currency="DAI" /> (meaning
                        <format-currency :value="auction.amountPerCollateral" currency="DAI" />
                        per <format-currency :currency="auction.collateralSymbol" /> on average) after
                        <time-till :date="auction.till" />.
                    </template>
                </TextBlock>

                <TextBlock title="Different ways to bid" class="TextBlock mt-8">
                    There are two ways to participate in an auction:
                    <ul class="list-disc list-outside pl-5">
                        <li>
                            Purchase with DAI: This allows the participant to manually bid DAI on the auctioned
                            collateral and redeem the auctioned collateral. Partial bids are also allowed.
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
                    <Tooltip title="This transaction type is not supported yet" placement="bottom">
                        <div>
                            <Button disabled type="secondary" class="w-60 mb-4" @click="$emit('purchase')">
                                Purchase with DAI
                            </Button>
                        </div>
                    </Tooltip>
                    <Tooltip :title="errorText" placement="bottom">
                        <div>
                            <Button
                                :disabled="error !== '' || !auction.isActive || auction.transactionAddress"
                                type="primary"
                                class="w-60 ml-4"
                                @click="$emit('swap')"
                            >
                                Directly swap into profit
                            </Button>
                        </div>
                    </Tooltip>
                </div>
            </TextBlock>
        </div>
        <Loading v-else-if="isAuctionsLoading" is-loading class="w-full self-center Loading h-48" />
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import { Alert, Tooltip } from 'ant-design-vue';
import TextBlock from '~/components/common/TextBlock.vue';
import TimeTill from '~/components/common/TimeTill.vue';
import Button from '~/components/common/BaseButton.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import Loading from '~/components/common/Loading.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    name: 'Auction',
    components: {
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
    },
    props: {
        auction: {
            type: Object as Vue.PropType<Auction>,
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
            } else if (!this.auction?.isActive && !this.isAuctionsLoading) {
                return 'This auction is inactive and must be restarted';
            } else if (this.auction?.transactionAddress) {
                return 'This auction is finished';
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
