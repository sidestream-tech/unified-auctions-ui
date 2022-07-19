<template>
    <div class="h-screen h-full flex justify-center items-center">
        <div class="relative z-10 text-center">
            <div class="text-6xl lg:text-7xl font-bold text-gray-800">Maker liquidations</div>
            <div class="text-4xl text-gray-600 mt-6 lg:mt-3">Coming soon!</div>

            <div class="mt-32">
                <div class="text-2xl text-gray-600">Last updated on {{ lastUpdatedDate }}</div>
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
import backgroundImage from '~/assets/images/background-image.jpg';

export default Vue.extend({
    name: 'ComingSoon',
    props: {
        lastUpdated: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            backgroundImage,
        };
    },
    computed: {
        lastUpdatedDate(): string {
            const date = new Date(this.lastUpdated);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        },
    },
});
</script>
