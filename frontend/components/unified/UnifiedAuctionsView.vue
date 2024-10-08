<template>
    <div class="HeightFix flex flex-col w-full h-full items-center">
        <LandingBlock v-if="isExplanationsShown" class="LandingBlock">
            <h1 class="text-gray-800 dark:text-gray-100">Unified Auctions</h1>
        </LandingBlock>
        <div class="flex flex-col w-full items-center space-y-4 md:space-y-8 mt-4 md:mt-8 mb-4 px-4">
            <TextBlock v-if="isExplanationsShown" title="Different auction types" class="max-w-screen-sm">
                There are three distinct auction types that help maintain
                <Explain text="Maker Protocol’s">
                    a <a href="https://changelog.makerdao.com/">set of smart contracts</a> running on the Ethereum
                    blockchain with the purpose to keep the cryptoasset Dai approximately equal to USD
                </Explain>
                solvency. They are taking effect in different situations like liquidation of single debt positions, to
                cap accrued system surplus or to cover system’s debt.
            </TextBlock>
            <AuctionTypeFilter :is-explanations-shown="isExplanationsShown" @selected="applyFilter" />
            <div class="w-full max-w-screen-sm items-center">
                <TextBlock
                    v-if="isExplanationsShown"
                    class="w-full mb-4"
                    :title="filter ? 'Tools that support this auction type' : 'Existing auction tools'"
                />
                <transition-group name="Tool-List" class="space-y-4">
                    <li
                        v-for="tool in filteredToolList"
                        :key="tool.title"
                        class="Tool list-none w-full max-w-screen-sm"
                    >
                        <AuctionTool
                            class="w-full"
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
                </transition-group>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import AuctionTypeFilter from '~/components/unified/AuctionTypeFilter.vue';
import Explain from '~/components/common/other/Explain.vue';
import AuctionTool from '~/components/unified/AuctionTool.vue';
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
                    title: 'Collateral auctions portal',
                    description:
                        'Web tool that supports participation in collateral auctions without capital requirements or by bidding with own Dai',
                    links: {
                        source: 'https://github.com/sidestream-tech/unified-auctions-ui',
                        participate: '/collateral',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Debt auctions portal',
                    description:
                        'Web tool that supports participation in debt auctions by bidding on MKR with own Dai',
                    links: {
                        source: 'https://github.com/sidestream-tech/unified-auctions-ui',
                        participate: '/debt',
                    },
                    filters: ['debt'],
                },
                {
                    title: 'Vault liquidations portal',
                    description:
                        'Web tool that supports liquidation of vaults that are no longer collaterlised enough',
                    links: {
                        source: 'https://github.com/sidestream-tech/unified-auctions-ui',
                        participate: '/vaults',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Liquidations platform',
                    description: 'Web tool that support participation in collateral auctions by bidding with own Dai',
                    links: {
                        source: 'https://github.com/makerdao/liquidations-portal',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Collateral Auction Twitter Bot',
                    description: `Tweets about collateral auctions and facilitates access to auction participation`,
                    links: {
                        profile: 'https://x.com/sidestream_labs',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'MakerBurn',
                    description: `
                    Shows various statistics on current state of the system like current Dai supply,
                    as well as collateral parameters and information on past liquidations`,
                    links: {
                        analytics: 'https://makerburn.com/',
                    },
                    filters: ['collateral', 'debt'],
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

.Tool {
    transition: all 0.6s;
}

.Tool-List-enter {
    opacity: 0;
    transform: translateY(-50px);
}

.Tool-List-leave-to {
    opacity: 0;
}

.Tool-List-leave-active {
    position: absolute;
}
</style>
