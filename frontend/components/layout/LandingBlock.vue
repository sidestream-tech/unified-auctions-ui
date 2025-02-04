<template>
    <div class="LandingBlock">
        <div v-if="!$slots.default" class="flex flex-col items-center w-full z-10 py-12">
            <div class="LandingTitle">{{ title }}</div>
            <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 mt-8">
                <Button class="SecondaryButton mx-3" @click="$emit('explanations', false)"
                    >I already know how it works</Button
                >
                <Button class="PrimaryButton mx-3" @click="$emit('explanations', true)"
                    >Please explain me what it is</Button
                >
            </div>
        </div>
        <div v-else class="flex flex-col items-center w-full z-10">
            <div class="LandingTitle">
                <slot />
            </div>
        </div>
        <div class="absolute inset-0 select-none bg-center bg-cover filter LadingBlockBackground" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Button from '~/components/common/inputs/BaseButton.vue';

export default Vue.extend({
    components: {
        Button,
    },
    props: {
        title: {
            type: String,
            default: 'Collateral auctions',
        },
    },
});
</script>

<style scoped>
.LandingBlock {
    @apply relative flex h-full text-center items-center w-full;
}
.ButtonBase {
    @apply border-none rounded-full flex items-center px-4 py-1.5 font-semibold text-left;
    @apply text-gray-700 dark:text-gray-200 transition duration-300 !important;
}
.PrimaryButton {
    @apply ButtonBase bg-primary-light bg-opacity-80 hover:bg-opacity-100;
}
.SecondaryButton {
    @apply ButtonBase bg-gray-200 dark:bg-opacity-60 bg-opacity-80 hover:bg-opacity-100;
}
.LandingTitle {
    @apply text-4xl font-bold text-gray-800 dark:text-gray-100 px-4;
}
.LadingBlockBackground {
    background-image: url('~/assets/images/background-image.jpg');
}
.dark .LadingBlockBackground {
    background-image: url('~/assets/images/background-image-dark.jpg');
}
</style>
