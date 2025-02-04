<template>
    <div class="HeightFix w-full h-full space-y-20 pb-20">
        <HeroSection class="HeroSection" />
        <LandingCard>
            <div class="w-full grid sm:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-max">
                <div
                    v-for="tool in toolList"
                    :key="tool.title"
                    class="
                        w-full
                        flex flex-col
                        overflow-hidden
                        px-6
                        py-5
                        rounded-lg
                        transition
                        duration-300
                        bg-white bg-opacity-60
                        dark:bg-dark dark:bg-opacity-60
                        hover:bg-opacity-100
                        dark:hover:bg-opacity-80
                    "
                >
                    <div class="pb-4">
                        <h3 class="font-semibold text-xl dark:text-white">{{ tool.title }}</h3>
                    </div>
                    <div class="flex flex-col flex-grow justify-between gap-y-6 text-gray-700 dark:text-gray-100">
                        <p>{{ tool.description }}</p>
                        <div class="flex flex-row flex-wrap justify-end gap-2 -mx-1">
                            <LinkButton v-if="tool.links.source" type="secondary" :link="tool.links.source">
                                Run your own bot
                            </LinkButton>
                            <LinkButton type="primary" :link="tool.links.participate">Participate via UI </LinkButton>
                        </div>
                    </div>
                </div>
            </div>
        </LandingCard>
        <LandingCard class="flex flex-col gap-y-4">
            <h2 class="font-semibold text-2xl text-white dark:text-gray-200">Other auction tools</h2>
            <div
                class="
                    divide-y divide-gray-200
                    overflow-hidden
                    rounded-lg
                    sm:grid sm:grid-cols-2 sm:gap-px sm:auto-rows-fr sm:divide-y-0
                "
            >
                <div v-for="(tool, toolIndex) in legacyToolList" :key="tool.title" :class="getToolClass(toolIndex)">
                    <div>
                        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-200 flex gap-2">
                            <LinkButton type="link" :link="tool.links.source" class="focus:outline-none">
                                <!-- Extend touch target to entire panel -->
                                <span class="absolute inset-0" aria-hidden="true" />
                                {{ tool.title }}
                            </LinkButton>
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
import LinkButton from '~/components/common/inputs/LinkButton.vue';

export default Vue.extend({
    components: {
        HeroSection,
        LandingCard,
        LinkButton,
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
                    title: 'Collateral auctions',
                    description:
                        'Web tool that supports participation in collateral auctions without capital requirements or by bidding with own DAI',
                    links: {
                        source: 'https://github.com/sidestream-tech/unified-auctions-ui/tree/main/bot#readme',
                        participate: '/collateral',
                    },
                },
                {
                    title: 'Debt auctions',
                    description:
                        'Web tool that supports participation in debt auctions by bidding on MKR with own DAI',
                    links: {
                        participate: '/debt',
                    },
                },
                {
                    title: 'Vault liquidations',
                    description: 'Web tool that supports liquidation of vaults that are not collaterlised enough',
                    links: {
                        participate: '/vaults',
                    },
                },
            ],
            legacyToolList: [
                {
                    title: 'Real-time feed with active actions',
                    description: 'X.com account that automatically tweets whenever there is a new Sky auction',
                    links: {
                        source: 'https://x.com/sidestream_labs',
                    },
                },
                {
                    title: 'Collateral liquidation analytics',
                    description: 'Official, the most up-to-date Sky analytics maintained by Block Analitica',
                    links: {
                        source: 'https://info.sky.money/liquidations',
                    },
                },
                {
                    title: 'Liquidation analytics on Makerburn',
                    description: `The page with various statistics on current state of the system,
                    as well as collateral parameters and information on past liquidations`,
                    links: {
                        source: 'https://makerburn.com/#/liquidations',
                    },
                },
                {
                    title: 'Source code of the exchange callees',
                    description: `Exchange callees are the contracts required to participate in the collateral auctions
                    without own Dai, using "flash loan" mechanics`,
                    links: {
                        source: 'https://github.com/makerdao/exchange-callees',
                    },
                },
            ],
        };
    },
    methods: {
        getToolClass(toolIndex: number) {
            const baseClass =
                'ToolList p-6 group relative bg-white bg-opacity-60 dark:bg-dark dark:bg-opacity-60 transition duration-300';
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

.ToolList:hover {
    @apply bg-opacity-100;
}
</style>
