<template>
    <div class="flex flex-col w-full space-y-10">
        <div v-for="feature in features" :key="feature.name">
            <TextBlock :title="feature.title">
                <div class="mb-4">
                    <span class="text-gray-700 dark:text-gray-200">URL:</span>
                    <a v-if="feature.url" :href="feature.url"> {{ feature.url }} </a>
                    <span v-else class="italic">Not yet implemented</span>
                </div>
                <h3 class="text-lg text-gray-700 font-semibold dark:text-gray-200 my-2">List of features:</h3>
                <feature-items :items="feature.items" />
            </TextBlock>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FeatureItems from '~/components/common/other/FeatureItems.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import features from '~/data/FeatureTexts';

export default Vue.extend({
    components: {
        TextBlock,
        FeatureItems,
    },
    data() {
        return {
            features,
        };
    },
});
</script>

<style scoped>
ul >>> ul > ul {
    @apply ml-8;

    list-style-type: circle;
}

ul >>> ul ul ul {
    list-style-type: square;
}

ul >>> ul ul ul ul {
    list-style-type: disc;
}
</style>
