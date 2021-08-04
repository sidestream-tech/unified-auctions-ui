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
            Currently, there are {{ numberOfOpenAuctions }} open auctions with the total value of
            {{ openAuctionsTotalValue }} DAI/USD. Smallest available vault is only
            {{ smallestAvailableVault }} DAI/USD.
        </TextBlock>
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
<script>
import TextBlock from '~/components/common/TextBlock';
export default {
    components: {
        TextBlock,
    },
    props: {
        // ToDo: the first 3 props will be removed and replaced by computed properties
        numberOfOpenAuctions: {
            type: Number,
            default: 0,
        },
        openAuctionsTotalValue: {
            type: Number,
            default: 0,
        },
        smallestAvailableVault: {
            type: Number,
            default: 0,
        },
        liquidationAuctions: {
            type: Array,
            default: () => [],
        },
    },
};
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}
</style>
