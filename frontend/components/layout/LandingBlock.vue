<template>
    <div class="LandingBlock" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="flex flex-col items-center w-full">
            <div class="LandingTitle">Maker liquidations</div>
            <div class="flex my-8">
                <Button class="mx-3 rounded-full" @click="$emit('explanations', false)"
                    >I already know how it works</Button
                >
                <Button class="GreenButton mx-3" @click="$emit('explanations', true)"
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
    @apply relative flex h-full text-center items-center w-full;
}
.GreenButton {
    @apply rounded-full border-2 hover:text-white focus:text-white;

    background-color: #8dd7cf;
    border-color: #1cad9f;
}
.LandingTitle {
    @apply text-2xl font-bold;

    color: #374251;
}
</style>
