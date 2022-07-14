<template>
    <div :class="isStagingEnvironment ? 'SplitLayoutStagingContainer' : 'SplitLayoutContainer'">
        <SplitLayout :step.sync="step">
            <template #step0>
                <div v-if="isExplanationsShown" class="h-1/2">
                    <LandingBlock title="Surplus auctions" @explanations="explanationsTrigger" />
                </div>
                <div class="mx-4 md:mx-0 SurplusTextContainer">
                    <SurplusText ref="surplusText" :is-explanations-shown="isExplanationsShown" />
                </div>
            </template>
        </SplitLayout>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import SplitLayout from '~/components/layout/SplitLayout.vue';
import SurplusText from '~/components/surplus/SurplusText.vue';

export default Vue.extend({
    components: {
        LandingBlock,
        SplitLayout,
        SurplusText,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data: () => ({
        step: 0,
        secondStep: '',
    }),
    computed: {
        isStagingEnvironment(): boolean {
            return !!process.env.STAGING_BANNER_URL;
        },
    },
    methods: {
        explanationsTrigger(event: boolean): void {
            if (event === true && this.$refs.surplusText) {
                (this.$refs.surplusText as Vue).$el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
            this.$emit('update:isExplanationsShown', event);
        },
    },
});
</script>

<style scoped>
.SplitLayoutContainer {
    height: calc(100vh - 4rem);
}

.SplitLayoutStagingContainer {
    margin-top: 2.3rem;
    height: calc(100vh - 6.3rem);
}

.SurplusTextContainer {
    min-height: calc(100vh - 10rem);
}
</style>
