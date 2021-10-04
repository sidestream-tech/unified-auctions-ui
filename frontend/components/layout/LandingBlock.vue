<template>
    <div class="LandingBlock">
        <div class="flex flex-col items-center w-full z-10">
            <div class="LandingTitle">Maker liquidations</div>
            <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 my-8">
                <Button class="SecondaryButton mx-3" @click="$emit('explanations', false)"
                    >I already know how it works</Button
                >
                <Button class="PrimaryButton mx-3" @click="$emit('explanations', true)"
                    >Please explain me what it is</Button
                >
            </div>
        </div>
        <div
            class="absolute inset-0 select-none bg-center bg-cover filter dark:invert"
            :style="{ backgroundImage: `url(${backgroundImage})` }"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Button from '~/components/common/BaseButton.vue';
import backgroundImage from '~/assets/images/background-image.png';

export default Vue.extend({
    components: {
        Button,
    },
    data() {
        return {
            backgroundImage,
        };
    },
});
</script>

<style scoped>
.LandingBlock {
    @apply relative flex h-full text-center items-center w-full;
}
.ButtonBase {
    @apply rounded-full border-2;
}
.PrimaryButton {
    @apply ButtonBase bg-primary-light border-primary focus:bg-primary-light hover:bg-white hover:text-primary focus:text-primary dark:bg-primary-dark dark:border-primary-dark dark:text-white dark:hover:bg-primary;
}
.SecondaryButton {
    @apply ButtonBase border-gray-500 hover:text-primary focus:text-primary hover:border-primary dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500;
}
.LandingTitle {
    @apply text-4xl font-bold text-gray-800 dark:text-gray-100;
}
</style>
