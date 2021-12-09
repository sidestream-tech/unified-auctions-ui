<template>
    <div
        class="HeightFix flex flex-col w-full h-full items-center space-y-8"
        :class="{ 'mt-8': !isExplanationsShown }"
    >
        <LandingBlock v-if="isExplanationsShown" use-custom-header class="LandingBlock">
            <h1>
                Maker Protocol <br />
                Unified Auctions
            </h1>
        </LandingBlock>
        <TextBlock v-if="isExplanationsShown" title="Different auction types" class="max-w-screen-sm">
            There are three distinct auction types that help maintain
            <Explain text="Maker Protocol’s">
                a <a href="https://changelog.makerdao.com/">set of smart contracts</a> running on the Ethereum
                blockchain with the purpose to keep the cryptoasset Dai approximately equal to USD
            </Explain>
            solvency. They are taking effect in different situations like liquidation of single debt positions, to cap
            accrued system surplus or to cover system’s debt.
        </TextBlock>
        <AuctionTypeFilter :is-explanations-shown="isExplanationsShown" @selected="applyFilter" />
        <div>
            <TextBlock
                v-if="isExplanationsShown"
                class="w-full max-w-screen-sm mb-3"
                :title="filter ? 'Tools that support this auction type' : 'Existing auction tools'"
            />
            <div class="space-y-4 w-full max-w-screen-sm items-center">
                <li v-for="tool in filteredToolList" :key="tool.title" class="list-none">
                    <AuctionTool
                        :title="tool.title"
                        :is-explanations-shown="isExplanationsShown"
                        :source-url="tool.links.source"
                        :participate-url="tool.links.participate"
                        :analytics-url="tool.links.analytics"
                        :profile-url="tool.links.profile"
                    >
                        {{ tool.description }}
                    </AuctionTool>
                </li>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import AuctionTypeFilter from '~/components/utils/AuctionTypeFilter.vue';
import Explain from '~/components/utils/Explain.vue';
import AuctionTool from '~/components/utils/AuctionTool.vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';

export default Vue.extend({
    components: {
        TextBlock,
        AuctionTypeFilter,
        Explain,
        AuctionTool,
        LandingBlock,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            filter: '',
            toolList: [
                {
                    title: 'Swap collateral auctions',
                    description:
                        'Web tool that supports participation in collateral auctions without capital requirements',
                    links: {
                        source: 'https://github.com/sidestream-tech/unified-auctions-ui',
                        participate: '/collateral',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Liquidations platform',
                    description: 'Web tool that support participation in collateral auctions by bidding with own Dai',
                    links: {
                        source: 'https://github.com/makerdao/liquidations-portal',
                        participate: 'https://liquidations.makerdao.com/',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Surplus auction portal',
                    description:
                        'Web tool that supports participation in surplus auctions by bidding on Dai with own MKR',
                    links: {
                        source: 'https://github.com/makerdao/auctions-ui',
                        participate: 'https://auctions.makerdao.com/flap',
                    },
                    filters: ['surplus'],
                },
                {
                    title: 'Debt auction portal',
                    description:
                        'Web tool that supports participation in debt auctions by bidding on MKR with own Dai',
                    links: {
                        source: 'https://github.com/makerdao/auctions-ui',
                        participate: 'https://auctions.makerdao.com/flop',
                    },
                    filters: ['debt'],
                },
                {
                    title: 'Auction Demo Keeper',
                    description: `
                    Node.js-based reference implementation for a keeper that
                    participates in collateral auctions via swap transactions`,
                    links: {
                        source: 'https://github.com/makerdao/auction-demo-keeper',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Auction Keeper',
                    description: `
                    Python-based implementation of a bot that is capable to participate in
                    all different auction types (collateral auction, surplus auctions, debt auctions)
                    as well as as a bot to start auctions based on undercollateralized vaults`,
                    links: {
                        source: 'https://github.com/makerdao/auction-keeper',
                    },
                    filters: ['collateral', 'surplus', 'debt'],
                },
                {
                    title: 'MakerBurn',
                    description: `
                    Shows various statistics on current state of the system like current Dai supply,
                    as well as collateral parameters and information on past liquidations`,
                    links: {
                        analytics: 'https://makerburn.com/',
                    },
                    filters: ['collateral', 'surplus', 'debt'],
                },
                {
                    title: 'Blockanalytica',
                    description: 'Shows detailed information on auction activity including participation metrics',
                    links: {
                        analytics: 'https://maker.blockanalitica.com/auctions/',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Daiauctions',
                    description: `
                    Shows current auction parameters on general and collateral level as well as the status
                    of auctions that have been started in the last few days`,
                    links: {
                        analytics: 'https://daiauctions.com/#',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Catflip',
                    description: `
                    Provides overview on system parameters including auction related parameters on a per collateral basis`,
                    links: {
                        analytics: 'https://catflip.co/maker/',
                    },
                    filters: ['collateral', 'surplus', 'debt'],
                },
                {
                    title: 'Daistats',
                    description: `
                    Provides overview on different auction related parameters like number of surplus,
                    debt and collateral auctions`,
                    links: {
                        analytics: 'https://daistats.com/#/auctions',
                    },
                    filters: ['collateral', 'surplus', 'debt'],
                },
                {
                    title: 'MakerDai Twitter Bot',
                    description:
                        'Tweets about mints/burns, liquidations and other significant changes in the Maker Protocol',
                    links: {
                        profile: 'https://twitter.com/MakerDaiBot',
                    },
                    filters: [],
                },
            ],
        };
    },
    computed: {
        filteredToolList(): Array<Object> {
            if (this.filter === '') {
                return this.toolList;
            }
            return this.toolList.filter(tool => {
                const filters = tool.filters as Array<Object>;
                return filters.includes(this.filter);
            });
        },
    },
    methods: {
        applyFilter(selectedFilter: string) {
            this.filter = selectedFilter;
        },
    },
});
</script>

<style scoped>
.PrimaryButton {
    @apply px-4 py-1.5 border-2 rounded-md border-primary-light font-semibold text-primary;
}

.LandingBlock {
    @apply w-full;

    min-height: 33vh;
}

.HeightFix {
    min-height: 75vh;
}
</style>
