<template>
    <div class="HeroSection">
        <LandingCard class="relative flex flex-col gap-y-8 py-24">
            <h2 class="max-w-xl md:max-w-3xl text-5xl font-semibold text-balance whitespace-pre-line sm:text-7xl">
                {{
                    `The unified platform 
                    to participate in the 
                    Sky protocol auctions`
                }}
            </h2>
        </LandingCard>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LandingCard from '~/components/layout/LandingCard.vue';

export default Vue.extend({
    components: {
        LandingCard,
    },
});
</script>
<style scoped>
.HeroSection {
    @apply w-full h-full;
}
.HeroBackground {
    background-image: url('~/assets/images/background-image.jpg');
}
.dark .HeroBackground {
    background-image: url('~/assets/images/background-image-dark.jpg');
}
</style>
