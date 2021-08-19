<template>
    <TextBlock :title="`Auction #${auction.id}`">
        <table class="w-full mt-4 table-fixed border-collapse border">
            <thead>
                <tr>
                    <th class="w-1/2">Collateral type</th>
                    <td class="w-1/2">{{ auction.collateralType }}</td>
                </tr>
                <tr>
                    <td>Amount</td>
                    <td>{{ auction.amountRAW }} {{ auction.collateralType }}</td>
                </tr>
                <tr>
                    <td>DAI</td>
                    <td>
                        {{ auction.amountDAI }}
                    </td>
                </tr>
                <tr>
                    <td>Time till the end</td>
                    <td>
                        <time-till :date="auction.till" />
                    </td>
                </tr>
                <tr>
                    <td>More auction data</td>
                    <td>
                        {{ auction.moreData }}
                    </td>
                </tr>
            </thead>
        </table>

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
import TextBlock from './common/TextBlock.vue';
import TimeTill from './common/TimeTill.vue';
import Button from './common/BaseButton.vue';

export default Vue.extend({
    name: 'Auction',
    components: {
        TextBlock,
        TimeTill,
        Button,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<Auction>,
            required: true,
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
