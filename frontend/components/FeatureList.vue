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
                <ul
                    v-for="(point, index) in feature.features"
                    :key="index"
                    class="list-inside list-disc text-gray-700 dark:text-gray-200"
                >
                    <li :class="`Indent-${point.indent}`">{{ point.text }}</li>
                </ul>
            </TextBlock>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import features from '~/data/FeatureTexts';

export default Vue.extend({
    components: {
        TextBlock,
    },
    data() {
        return {
            features,
        };
    },
});
</script>

<style scoped>
.Indent-1 {
    margin-left: 25px;
    list-style-type: circle;
}

.Indent-2 {
    margin-left: 50px;
    list-style-type: square;
}

.Indent-3 {
    margin-left: 75px;
}
</style>
