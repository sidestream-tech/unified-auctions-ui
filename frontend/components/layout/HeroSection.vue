<template>
    <div class="HeroSection">
        <LandingCard class="relative flex flex-col py-5">
            <h2
                class="
                    max-w-xl
                    md:max-w-3xl
                    text-5xl
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
</style>
