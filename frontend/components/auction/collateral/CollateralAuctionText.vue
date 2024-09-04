<template>
    <div class="flex flex-col space-y-8 py-8">
        <WhatIsMakerProtocol v-if="isExplanationsShown" class="TextBlock"></WhatIsMakerProtocol>
        <TextBlock v-if="isExplanationsShown" class="TextBlock">
            <template #title>
                What are the
                <Explain text="collateral auctions">
                    A
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation"
                        target="_blank"
                        >collateral auction</a
                    >
                    is the automatic transfer of collateral from an insufficiently collateralized Vault to the
                    protocol.</Explain
                >?
            </template>
            To get DAI, people need to lock up some other cryptocurrency (e.g., ETH) in a vault. With time, if the
            price of the cryptocurrency in the vault drops below the
            <Explain text="predefined ratio">
                <a
                    href="https://community-development.makerdao.com/en/learn/vaults/liquidation/#:~:text=available%20for%20withdrawal.-,Liquidation%20Ratio,-The%20Liquidation%20Ratio"
                    target="_blank"
                >
                    The Liquidation Ratio
                </a>
                is the minimum required collateralization level for each Vault type before it is considered
                undercollateralized and subject to liquidation
            </Explain>
            (e.g. 145% for ETH-A), owners of the vault have to add more collateral or return their DAI. If they fail to
            do so, their vault can be liquidated by the Maker protocol and other people can buy it at a discount.
        </TextBlock>
        <template v-if="isExplanationsShown">
            <TextBlock title="Why should I participate?" class="TextBlock">
                Your participation can yield a profit by leveraging price differences between the auction price from
                Maker Protocol and the price on other marketplaces. Similar to a Dutch-style auction system, the
                auction price starts above the real market price and drops by a defined ratio in defined time
                intervals. For example, ETH-A auctions start 30% above the market price and drop by
                <format-percentage :value="params.priceDropRatio" /> every
                {{ params.secondsBetweenPriceDrops }} seconds. When the auction price drops below the exchange rate on
                other marketplaces there is a chance to make a profit.
            </TextBlock>
            <TextBlock v-if="auctions.length > 0" title="Active auctions" class="TextBlock w-full">
                There {{ unfinishedAuctionsCount === 1 ? 'is' : 'are' }} {{ unfinishedAuctionsCount }} auction<span
                    v-if="unfinishedAuctionsCount !== 1"
                    >s</span
                >
                for {{ openAuctionCurrencyTypes.length }} different types of collateral. {{ inactiveAuctionsCount }} of
                them need to be restarted.
            </TextBlock>
            <TextBlock v-else title="No active auctions" class="TextBlock">
                Currently, there are no active auctions. Times of steep price drops in cryptocurrencies bear the
                highest probability for auctions to be triggered.
            </TextBlock>
        </template>
        <div
            class="w-full self-center"
            :class="{ 'max-w-4xl': isExplanationsShown, 'md:px-10': !isExplanationsShown }"
        >
            <CollateralAuctionsTable
                class="block overflow-x-auto"
                :is-loading="isAuctionsLoading"
                :error="auctionsError"
                :auctions="auctions"
                :selected-auction-id.sync="selectedAuctionId"
                :show-more-rows="!isExplanationsShown"
                :last-updated="lastUpdated"
            />
        </div>
        <TextBlock v-if="isExplanationsShown" title="What is the catch?" class="TextBlock">
            This situation exists in the first place, because the Maker protocol can not be executed by itself. There
            need to be players who execute vital parts of the protocol and pay a
            <Explain text="transaction fee">
                Transaction fees are paid as
                <a href="https://ethereum.org/en/developers/docs/gas/" target="_blank"> Gas </a>
                for the Ethereum network. It is the fuel that allows it to operate, in the same way, that a car needs
                gasoline to run.
            </Explain>
            for it. In a decentralised system like this, anyone can become such a player. But as execution can
            sometimes end up in a loss of transaction fee, those operations are made to be profitable by the protocol
            itself. Players who risk to make DAI more stable and keep the protocol in a
            <Explain text="healthy condition" placement="topRight">
                Overall health of the system is predominantly defined by the surplus in collateral that is backing all
                DAI. This system health can be monitored on
                <a href="https://daistats.com/#/" target="_blank">daistats</a>.
            </Explain>
            get rewarded with higher profits. Most of the auctions will be cleared by players with bots bidding very
            quickly, whenever there is a slight market opportunity. However, in some occasions like bigger market
            crashes a larger number of auctions will be started. That’s when regular users and newcomers can have an
            opportunity to engage, as there can be not enough market players to clear all of them.
        </TextBlock>
    </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import type { Auction } from 'auctions-core/src/types';
import WhatIsMakerProtocol from '~/components/common/other/WhatIsMakerProtocol.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import CollateralAuctionsTable from '~/components/auction/collateral/CollateralAuctionsTable.vue';
import FormatPercentage from '~/components/common/formatters/FormatPercentage.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        FormatPercentage,
        TextBlock,
        CollateralAuctionsTable,
        Explain,
        WhatIsMakerProtocol,
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
        lastUpdated: {
            type: Date,
            default: null,
        },
    },
    computed: {
        openAuctionCurrencyTypes(): Array<string> {
            const currencyTypes: string[] = [];
            this.auctions.forEach(auction => {
                if (!currencyTypes.includes(auction.collateralType)) {
                    currencyTypes.push(auction.collateralType);
                }
            });
            return currencyTypes;
        },
        inactiveAuctionsCount(): number {
            let nonActiveAuctions = 0;
            this.auctions.forEach(auction => {
                if (!auction.isActive) {
                    nonActiveAuctions++;
                }
            });
            return nonActiveAuctions;
        },
        unfinishedAuctionsCount(): number {
            return this.auctions.filter(auction => !auction.isFinished).length;
        },
        params(): MakerParams {
            return {
                secondsBetweenPriceDrops: 90,
                priceDropRatio: 0.01,
            };
        },
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}
</style>
