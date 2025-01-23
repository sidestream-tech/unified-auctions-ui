<template>
    <div class="HeightFix w-full h-full space-y-20 pb-20">
        <HeroSection class="HeroSection" />
        <LandingCard>
            <div class="w-full grid sm:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
                <AuctionCard
                    v-for="tool in toolList"
                    :key="tool.title"
                    :title="tool.title"
                    :content="tool.description"
                >
                    <div class="flex items-end gap-2">
                        <LinkButton v-if="tool.links.source" type="secondary" :link="tool.links.source">
                            Run your own bot
                        </LinkButton>
                        <LinkButton type="primary" :link="tool.links.participate">Participate via Ul</LinkButton>
                    </div>
                </AuctionCard>
            </div>
        </LandingCard>
        <LandingCard class="flex flex-col gap-y-6">
            <h2 class="font-semibold text-xl dark:text-gray-200">Other existing auction tools</h2>
            <div
                class="
                    divide-y divide-gray-200
                    overflow-hidden
                    rounded-lg
                    bg-gray-200
                    dark:bg-gray-600
                    sm:grid sm:grid-cols-2 sm:gap-px sm:auto-rows-fr sm:divide-y-0
                "
            >
                <div v-for="(tool, toolIndex) in legacyToolList" :key="tool.title" :class="getToolClass(toolIndex)">
                    <div>
                        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-200 flex gap-2">
                            <a :href="tool.links.source" class="focus:outline-none">
                                <!-- Extend touch target to entire panel -->
                                <span class="absolute inset-0" aria-hidden="true" />
                                {{ tool.title }}
                            </a>
                            <ExternalLink class="w-5 h-5 ml-0.5 -mr-0.5 fill-current" />
                        </h3>
                        <p class="mt-2 text-sm text-gray-500 dark:text-gray-100">{{ tool.description }}</p>
                    </div>
                </div>
            </div>
        </LandingCard>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HeroSection from '~/components/layout/HeroSection.vue';
import LandingCard from '~/components/layout/LandingCard.vue';
import AuctionCard from '~/components/layout/AuctionCard.vue';
import LinkButton from '~/components/common/inputs/LinkButton.vue';
import ExternalLink from '~/assets/icons/external-link.svg';

export default Vue.extend({
    components: {
        HeroSection,
        LandingCard,
        AuctionCard,
        LinkButton,
        ExternalLink,
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
                        participate: '/debt',
                    },
                    filters: ['debt'],
                },
                {
                    title: 'Vault liquidations portal',
                    description:
                        'Web tool that supports liquidation of vaults that are no longer collaterlised enough',
                    links: {
                        participate: '/vaults',
                    },
                    filters: ['collateral'],
                },
            ],
            legacyToolList: [
                {
                    title: 'Collateral liquidation analytics',
                    description: '',
                    links: {
                        source: 'https://info.sky.money/liquidations',
                    },
                    filters: ['collateral'],
                },
                {
                    title: 'Legacy liquidation analytics',
                    description: `
                    Shows various statistics on current state of the system like current Dai supply,
                    as well as collateral parameters and information on past liquidations`,
                    links: {
                        source: 'https://makerburn.com/#/liquidations',
                    },
                    filters: ['collateral', 'debt'],
                },
                {
                    title: 'Source code of the exchange callees',
                    description: '',
                    links: {
                        source: 'https://github.com/makerdao/exchange-callees',
                    },
                    filters: ['collateral', 'debt'],
                },
                {
                    title: 'Source code of the legacy collateral auctions UI',
                    description: 'Web tool that support participation in collateral auctions by bidding with own Dai',
                    links: {
                        source: 'https://github.com/makerdao/liquidations-portal',
                    },
                    filters: ['collateral'],
                },
            ],
        };
    },
    methods: {
        getToolClass(toolIndex: number) {
            const baseClass = 'ToolList group relative bg-white dark:bg-gray-800 p-6';
            const roundedClasses = [
                toolIndex === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
                toolIndex === 1 ? 'sm:rounded-tr-lg' : '',
                toolIndex === this.legacyToolList.length - 2 ? 'sm:rounded-bl-lg' : '',
                toolIndex === this.legacyToolList.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
            ];
            return [baseClass, ...roundedClasses].join(' ');
        },
    },
});
</script>

<style scoped>
.HeroSection {
    @apply w-full;
}

.PrimaryButton {
    @apply px-4 py-1.5 border-2 rounded-md border-primary-light font-semibold text-primary;
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

.ToolList:hover {
    @apply ring-2 ring-inset ring-primary-purple dark:ring-primary;
}
</style>
