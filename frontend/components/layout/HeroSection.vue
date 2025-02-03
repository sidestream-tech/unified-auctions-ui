<template>
    <div class="HeroSection">
        <LandingCard class="relative flex flex-col pt-10 sm:py-5">
            <h2
                class="
                    max-w-xl
                    md:max-w-3xl
                    text-3xl
                    sm:text-7xl
                    font-semibold
                    text-balance
                    whitespace-pre-line
                    text-white
                    dark:text-gray-200
                "
            >
                {{
                    `The unified platform
                    to participate
                    in Sky auctions`
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
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@14..32,600&display=swap');
.HeroSection {
    @apply w-full h-full;
}
h2 {
    letter-spacing: 0;
    line-height: 1.05;
    font-family: 'Inter', sans-serif;
    font-optical-sizing: auto;
    font-weight: 600;
    font-style: normal;
}
</style>
