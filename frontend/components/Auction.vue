<template>
    <TextBlock :title="`Auction #${auction.id}`">
        <table class="w-full mt-4 table-fixed border-collapse border">
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
                        <td>{{ auction.till.toUTCString() }}</td>
                    </tr>
                </template>
            </tbody>
        </table>
        <button
            class="w-full border-2 border-gray-300 p-1 border-t-0 text-center text-gray-400"
            @click="toggleExpandable"
        >
            {{ isTableExpanded ? 'Hide additional numbers' : 'Show additional numbers' }}
        </button>

        <TextBlock class="mt-4">
            <div class="font-medium">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrudexercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
            </div>
            <div class="flex mt-4">
                <div class="flex-grow" />
                <Button type="primary" @click="$emit('vat')"> Connect wallet & Deposit to VAT & Bid </Button>
            </div>
        </TextBlock>

        <TextBlock class="mt-4">
            <div class="font-medium">
                Flash Loans explainations. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </div>
            <div class="flex mt-4">
                <div class="flex-grow" />
                <Button type="primary" @click="$emit('flash-loan')"> Connect wallet & Bid with Flash Loan </Button>
            </div>
        </TextBlock>
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
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
    },
    props: {
        auction: {
            type: Object as Vue.PropType<Auction>,
            required: true,
        },
    },
    data() {
        return {
            isTableExpanded: false,
        };
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
</style>
