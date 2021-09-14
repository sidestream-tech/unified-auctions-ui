<template>
    <TextBlock :title="`Auction #${auctionId}`">
        <Alert v-if="errorText" :message="errorText" type="error" />
        <div v-if="auction">
            <div class="relative mt-4">
                <table class="w-full table-fixed border-collapse border">
                    <tbody>
                        <tr>
                            <td class="w-1/2">Currency</td>
                            <td class="w-1/2 uppercase">{{ auction.collateralType }}</td>
                        </tr>
                        <tr>
                            <td>Auction Amount</td>
                            <td>
                                <format-currency :value="auction.amountRAW" :currency="auction.collateralType" />
                            </td>
                        </tr>
                        <tr>
                            <td>Auction Price</td>
                            <td>
                                <format-currency :value="auction.amountPerCollateral" currency="DAI" />
                                per
                                <format-currency :currency="auction.collateralType" />
                            </td>
                        </tr>
                        <tr>
                            <td>Market Value*</td>
                            <td><format-market-value :value="auction.marketValue" /></td>
                        </tr>
                        <tr>
                            <td>Next price drop</td>
                            <td>
                                <time-till :date="auction.till" />
                            </td>
                        </tr>
                        <template v-if="isTableExpanded">
                            <tr class="bg-gray-100">
                                <td>Auction price total</td>
                                <td>
                                    <format-currency :value="auction.amountDAI" currency="DAI" />
                                </td>
                            </tr>
                            <tr class="bg-gray-100">
                                <td>Vault owner</td>
                                <td><format-address :value="auction.vaultOwner" /></td>
                            </tr>
                            <tr class="bg-gray-100">
                                <td>Auction ends at</td>
                                <td>{{ new Date(auction.till).toUTCString() }}</td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div v-if="error" class="Disable" />
            </div>
            <button
                class="w-full border-2 border-gray-300 p-1 border-t-0 text-center text-gray-400"
                @click="toggleExpandable"
            >
                {{ isTableExpanded ? 'Hide additional numbers' : 'Show additional numbers' }}
            </button>
            <template v-if="isExplanationsShown">
                <TextBlock class="mt-4">
                    <template v-if="!error">
                        The auctioned vault <format-address :value="auction.vaultOwner" /> contains
                        <format-currency :value="auction.amountRAW" :currency="auction.collateralType" />. Currently,
                        it is sold for <format-currency :value="auction.amountDAI" currency="DAI" />. This equals
                        <format-currency :value="auction.amountPerCollateral" currency="DAI" /> per
                        <format-currency :currency="auction.collateralType" />, or approximately
                        <format-market-value :value="auction.marketValue" /> than if you buy
                        <format-currency :currency="auction.collateralType" /> on another exchange platform such as
                        Uniswap.
                    </template>
                    <template v-else>
                        This auction was finished at {{ new Date(auction.till).toUTCString() }} at a closing auction
                        price of <format-currency :value="auction.amountPerCollateral" currency="DAI" /> (meaning
                        <format-currency :value="auction.amountPerCollateral" currency="DAI" />
                        per <format-currency :currency="auction.collateralType" /> on average) after
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
                            <a
                                target="_blank"
                                href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#flash-lending-of-collateral"
                            >
                                flash loan</a
                            >.
                        </li>
                    </ul>
                </TextBlock>
            </template>
            <TextBlock>
                <div class="flex mt-4 justify-between">
                    <Tooltip title="This transaction type is not supported yet" placement="bottom">
                        <div>
                            <Button disabled type="secondary" class="mr-3 w-60" @click="$emit('purchase')">
                                Purchase with DAI
                            </Button>
                        </div>
                    </Tooltip>
                    <Button :disabled="error !== ''" type="primary" class="w-60" @click="$emit('swap')">
                        Directly swap into profit
                    </Button>
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

export default Vue.extend({
    name: 'Auction',
    components: {
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
                return 'This Auction was not found';
            } else if (this.error) {
                return this.error;
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
    @apply p-2 border-2 border-collapse border-gray-300;
}
.Disable {
    @apply absolute inset-0 bg-gray-700 opacity-70;
}
</style>
