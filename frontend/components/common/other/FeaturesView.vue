<template>
    <div class="flex flex-col items-center">
        <LandingBlock class="LandingBlock">
            <h1 class="text-gray-800 dark:text-gray-100">Features Overview</h1>
        </LandingBlock>
        <div class="mt-8 px-4 md:px-0">
            <FeatureList class="max-w-screen-sm" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import FeatureList from '~/components/common/other/FeatureList.vue';

export default Vue.extend({
    components: {
        LandingBlock,
        FeatureList,
    },
});
</script>

<style scoped>
.LandingBlock {
    min-height: 33vh;
}
</style>
