<template>
    <TextBlock :title="`Auction #${auction.id}`">
        <Alert v-if="error" :message="error" type="error" />
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
                        <tr class="bg-gray-200">
                            <td>Auction price total</td>
                            <td>
                                <format-currency :value="auction.amountDAI" currency="DAI" />
                            </td>
                        </tr>
                        <tr class="bg-gray-200">
                            <td>Vault owner</td>
                            <td><format-address :value="auction.vaultOwner" /></td>
                        </tr>
                        <tr class="bg-gray-200">
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
            <TextBlock v-if="!error" class="mt-4">
                The auctioned vault <format-address :value="auction.vaultOwner" /> contains
                <format-currency :value="auction.amountRAW" :currency="auction.collateralType" />. Currently, it is
                sold for <format-currency :value="auction.amountDAI" currency="DAI" />. This equals
                <format-currency :value="auction.amountPerCollateral" currency="DAI" /> per
                <format-currency :currency="auction.collateralType" />, or approximately
                <format-market-value :value="auction.marketValue" /> than if you buy
                <format-currency :currency="auction.collateralType" /> on another exchange platform such as Uniswap.
            </TextBlock>
            <TextBlock v-else class="mt-10">
                This auction was finished at {{ new Date(auction.till).toUTCString() }} at a closing auction price of
                <format-currency :value="auction.amountPerCollateral" currency="DAI" /> (meaning
                <format-currency :value="auction.amountPerCollateral" currency="DAI" />
                per <format-currency :currency="auction.collateralType" /> on average) after
                <time-till :date="auction.till" />.
            </TextBlock>

            <TextBlock title="Different ways to bid" class="TextBlock mt-10">
                There are two ways to participate in an auction:
                <ul class="list-disc list-outside pl-5">
                    <li>
                        Purchase with DAI: This allows the participant to manually bid DAI on the auctioned collateral
                        and redeem the auctioned collateral. Partial bids are also allowed.
                    </li>
                    <li>
                        Directly swap into profit: The auctioned collateral is bought and sold on an available
                        marketplace in exchange for DAI in a single transaction. You will receive the resulting profit.
                        In the Maker community this is known as a
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
                <Button disabled type="secondary" class="mr-3 w-60" @click="$emit('purchase')">
                    Purchase with DAI
                </Button>
                <Button :disabled="error !== ''" type="primary" class="w-60" @click="$emit('swap')">
                    Directly swap into profit
                </Button>
            </div>
        </TextBlock>
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import TextBlock from '~/components/common/TextBlock.vue';
import TimeTill from '~/components/common/TimeTill.vue';
import Button from '~/components/common/BaseButton.vue';
import FormatMarketValue from '~/components/utils/FormatMarketValue.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    name: 'Auction',
    components: {
        FormatCurrency,
        TextBlock,
        TimeTill,
        Button,
        FormatMarketValue,
        FormatAddress,
        Alert,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<Auction>,
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
    },
    data() {
        return {
            isTableExpanded: false,
        };
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
