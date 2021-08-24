<template>
    <div class="flex flex-col">
        <TextBlock title="Maker DAO Liquidation" class="TextBlock">
            Dai (or DAI) is a stablecoin cryptocurrency which aims to keep its value as close to one United States
            dollar (USD) as possible through an automated system of smart contracts on the Ethereum blockchain . Dai is
            maintained and regulated by MakerDAO, a decentralized autonomous organization (DAO) composed of the owners
            of its governance token, MKR, who may vote on changes to certain parameters in its smart contracts in order
            to ensure the stability of Dai.
            <a class="text-gray-400" target="_blank" href="https://en.wikipedia.org/wiki/Dai_(cryptocurrency)">
                source: Wikipedia
            </a>
        </TextBlock>
        <TextBlock title="Current liquidation auctions" class="TextBlock my-5">
            Currently, there are {{ openAuctionsValues.length }} open auctions with the total value of
            {{ openAuctionsTotalValue }} DAI/USD. Smallest available vault is only
            {{ smallestAvailableVault }} DAI/USD.
        </TextBlock>
        <Loading class="max-w-screen-md w-full self-center mb-6 mt-1 Loading">
            <AuctionsTable :auctions="auctions" :selected-auction-id="selectedAuctionId" />
        </Loading>
        <TextBlock title="How to participate" class="TextBlock">
            <!-- ToDo: insert the real text -->
            Rerum at expedita sed aut odit quis doloremque est. Aut dolores qui aperiam quaerat commodi et. Tempora
            veritatis occaecati nihil doloribus veritatis voluptatibus. Beatae vel voluptates blanditiis quasi qui
            delectus necessitatibus sapiente repellat. Iste quis tempore sit quaerat. Ducimus earum numquam quo vel
            nisi. Dolor et error. Suscipit perferendis nisi. Quas porro recusandae molestiae omnis consequatur
            explicabo omnis quos animi. Ut fugiat cum facilis rerum nam nesciunt. Doloribus sed temporibus facilis
            rerum nisi est molestiae et quia. Corrupti iure aliquam eveniet dolores temporibus. Expedita maiores quos
            voluptas nihil vero recusandae voluptatem consequatur dolorem.
        </TextBlock>
    </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import AuctionsTable from '~/components/AuctionsTable.vue';
import Loading from '~/components/common/Loading.vue';

export default Vue.extend({
    components: {
        TextBlock,
        AuctionsTable,
        Loading,
    },
    props: {
        auctions: {
            type: Array as PropType<Auction[]>,
            default: () => [],
        },
        selectedAuctionId: {
            type: String,
            default: null,
        },
    },
    computed: {
        openAuctionsValues(): Array<number> {
            return this.auctions
                .filter((auction: Auction) => new Date(auction.till).getTime() > new Date().getTime())
                .map((auction: Auction) => Number(auction.amountDAI));
        },
        openAuctionsTotalValue(): number {
            return this.openAuctionsValues.reduce((a, b) => a + b, 0);
        },
        smallestAvailableVault(): number {
            if (this.openAuctionsValues.length === 0) {
                return 0;
            }
            return Math.min(...this.openAuctionsValues);
        },
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}

.Loading {
    min-height: 300px;
}
</style>
