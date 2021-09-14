<template>
    <div class="LandingBlock" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="flex flex-col items-center w-full">
            <div class="LandingTitle">Maker liquidations</div>
            <div class="flex my-8">
                <Button class="SecondaryButton mx-3" @click="$emit('explanations', false)"
                    >I already know how it works</Button
                >
                <Button class="PrimaryButton mx-3" @click="$emit('explanations', true)"
                    >Please explain me what it is</Button
                >
            </div>
        </div>
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
    @apply relative flex h-full text-center items-center w-full bg-center bg-cover;
}
.ButtonBase {
    @apply rounded-full border-2;
}
.PrimaryButton {
    @apply ButtonBase bg-primary-light border-primary focus:bg-primary-light hover:bg-white hover:text-primary focus:text-primary;
}
.SecondaryButton {
    @apply ButtonBase border-gray-500 hover:text-primary focus:text-primary hover:border-primary;
}
.LandingTitle {
    @apply text-4xl font-bold text-gray-800;
}
</style>
