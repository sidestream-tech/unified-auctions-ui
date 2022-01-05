<template>
    <div class="flex flex-col items-center">
        <LandingBlock v-if="isExplanationsShown" class="LandingBlock">
            <h1 class="text-gray-800 dark:text-gray-100">
                Maker Protocol <br />
                Auctions Dashboard
            </h1>
        </LandingBlock>
        <div class="mt-4 md:mt-8 px-4">
            <TextBlock v-if="isExplanationsShown" title="Information provided in the table" class="max-w-screen-sm">
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et
                ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem
                ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
                Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
            </TextBlock>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        LandingBlock,
        TextBlock,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
});
</script>

<style scoped>
.LandingBlock {
    @apply w-full;

    min-height: 33vh;
}
</style>
