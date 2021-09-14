<template>
    <div class="flex flex-col space-y-8 py-8">
        <TextBlock v-if="isExplanationsShown" title="What is the Maker Protocol?" class="TextBlock">
            The Maker Protocol is a set of rules that defines how a cryptocurrency called DAI is kept approximately
            equal to USD by incentivizing market players. People who help to keep DAI stable, benefit from their
            actions by acquiring cryptocurrency at a discount. The main promise of the protocol is to provide a
            decentralized stable currency, which can be used to borrow money over a longer period without being
            affected by unpredictable exchange rates.
        </TextBlock>
        <TextBlock v-if="isExplanationsShown" class="TextBlock">
            <template #title>
                What are the
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#resetting-an-auction"
                    target="_blank"
                    >Liquidations</a
                >?
            </template>
            To get DAI, people need to lock up some other cryptocurrency (e.g., ETH) in a vault. With time, if the
            price of the cryptocurrency in the vault drops below the predefined ratio (e.g. 150% for ETH), owners of
            the vault have to add more collateral or return their DAI. If they fail to do so, their vault can be
            liquidated by the Maker protocol and other people can buy it at a discount.
        </TextBlock>
        <template v-if="isExplanationsShown">
            <TextBlock title="How to profit?" class="TextBlock">
                Similar to a Dutch-style auction system, the liquidation auction price starts 30% above the market and
                drops by <format-percentage :value="params.cut" /> every {{ params.step }} seconds. The first person
                who bids on the auction wins it. During normal market conditions, auction price rarely drops
                <format-percentage :value="params.drop" /> beyond usual exchange rates on other platforms, so make sure
                to act quickly. If no one bids on the auction for for a certain amount of time or if price drops below
                a certain threshold, the auction will not accept any further bids and will require a reset.
            </TextBlock>
            <TextBlock v-if="auctions.length > 0" title="Active auctions" class="TextBlock w-full">
                There are {{ openAuctionsValues.length }} active auctions for
                {{ openAuctionCurrencyTypes.length }} different types of collateral, {{ openAuctionNotActive }} of them
                need<span v-if="openAuctionNotActive === 1">s</span> to be restarted.
            </TextBlock>
            <TextBlock v-else title="No active auctions" class="TextBlock">
                Currently, there are no active auctions. Times of steep price drops in cryptocurrencies bear the
                highest probability for auctions to be triggered.
            </TextBlock>
        </template>
        <Loading
            :is-loading="isAuctionsLoading"
            :error="auctionsError"
            class="w-full self-center Loading"
            :class="{ 'max-w-4xl': isExplanationsShown }"
        >
            <AuctionsTable
                :class="{ 'mx-10': !isExplanationsShown }"
                :auctions="auctions"
                :selected-auction-id.sync="selectedAuctionId"
            />
        </Loading>
    </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import AuctionsTable from '~/components/AuctionsTable.vue';
import Loading from '~/components/common/Loading.vue';
import { getParams } from '~/libs/getParams';
import FormatPercentage from '~/components/utils/FormatPercentage.vue';

export default Vue.extend({
    components: {
        FormatPercentage,
        TextBlock,
        AuctionsTable,
        Loading,
    },
    props: {
        auctions: {
            type: Array as PropType<Auction[]>,
            default: () => [],
        },
        isAuctionsLoading: {
            type: Boolean,
            default: false,
        },
        auctionsError: {
            type: String,
            default: null,
        },
        selectedAuctionId: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        openAuctionsValues(): Array<number> {
            return this.auctions
                .filter((auction: Auction) => new Date(auction.till).getTime() > new Date().getTime())
                .map((auction: Auction) => Number(auction.amountDAI));
        },
        openAuctionCurrencyTypes(): Array<string> {
            const currencyTypes: string[] = [];
            this.auctions.forEach(auction => {
                if (!currencyTypes.includes(auction.collateralType)) {
                    currencyTypes.push(auction.collateralType);
                }
            });
            return currencyTypes;
        },
        openAuctionNotActive(): number {
            let nonActiveAuctions = 0;
            this.auctions.forEach(auction => {
                if (!auction.isActive) {
                    nonActiveAuctions++;
                }
            });
            return nonActiveAuctions;
        },
        params(): MakerParams {
            return getParams;
        },
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}

.Loading {
    min-height: 100px;
}
</style>
