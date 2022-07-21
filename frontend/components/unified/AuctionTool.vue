<template>
    <div class="border-2 border-gray-300 py-2 px-3 rounded bg-white dark:bg-gray-900">
        <div class="flex justify-between items-center flex-col md:flex-row w-full">
            <h3 class="text-lg text-gray-700 dark:text-gray-200 font-extrabold pr-2 w-full whitespace-nowrap">
                {{ title }}
            </h3>
            <div class="space-x-1 w-full md:flex md:justify-end">
                <LinkButton v-if="sourceUrl" type="secondary" :link="sourceUrl">source code</LinkButton>
                <LinkButton v-if="profileUrl" type="secondary" :link="profileUrl">view profile</LinkButton>
                <LinkButton v-if="analyticsUrl" type="secondary" :link="analyticsUrl">view analytics</LinkButton>
                <LinkButton v-if="participateUrl" :link="participateUrl">participate</LinkButton>
            </div>
        </div>
        <div v-if="isExplanationsShown" class="text-gray-700 dark:text-gray-200 mt-2">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LinkButton from '~/components/common/inputs/LinkButton.vue';

export default Vue.extend({
    components: {
        LinkButton,
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        sourceUrl: {
            type: String,
            default: null,
        },
        participateUrl: {
            type: String,
            default: null,
        },
        analyticsUrl: {
            type: String,
            default: null,
        },
        profileUrl: {
            type: String,
            default: null,
        },
    },
});
</script>
