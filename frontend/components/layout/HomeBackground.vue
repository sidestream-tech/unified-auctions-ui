<template>
    <div class="HomeContainer">
        <div class="relative z-10">
            <slot />
        </div>

        <svg
            class="HomeBackground absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <radialGradient id="Gradient1" cx="50%" cy="50%" fx="10%" fy="50%" r=".5">
                    <animate attributeName="fx" dur="49s" values="0%;3%;0%" repeatCount="indefinite" />
                    <stop offset="0%" stop-color="#faf" />
                    <stop offset="100%" stop-color="#faf0" />
                </radialGradient>
                <radialGradient id="Gradient2" cx="50%" cy="50%" fx="10%" fy="50%" r=".5">
                    <animate attributeName="fx" dur="38.5s" values="0%;3%;0%" repeatCount="indefinite" />
                    <stop offset="0%" stop-color="#aaf" />
                    <stop offset="100%" stop-color="#aaf0" />
                </radialGradient>
                <radialGradient id="Gradient3" cx="50%" cy="50%" fx="50%" fy="50%" r=".5">
                    <animate attributeName="fx" dur="36.5s" values="0%;3%;0%" repeatCount="indefinite" />
                    <stop offset="0%" stop-color="#0df" />
                    <stop offset="100%" stop-color="#0df0" />
                </radialGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient1)">
                <animate attributeName="x" dur="35s" values="25%;0%;25%" repeatCount="indefinite" />
                <animate attributeName="y" dur="36s" values="0%;25%;0%" repeatCount="indefinite" />
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="22s"
                    repeatCount="indefinite"
                />
            </rect>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient2)">
                <animate attributeName="x" dur="38s" values="-25%;0%;-25%" repeatCount="indefinite" />
                <animate attributeName="y" dur="39s" values="0%;50%;0%" repeatCount="indefinite" />
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="23s"
                    repeatCount="indefinite"
                />
            </rect>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#Gradient3)">
                <animate attributeName="x" dur="40s" values="0%;25%;0%" repeatCount="indefinite" />
                <animate attributeName="y" dur="41s" values="0%;25%;0%" repeatCount="indefinite" />
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="360 50 50"
                    to="0 50 50"
                    dur="24s"
                    repeatCount="indefinite"
                />
            </rect>
        </svg>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'HomeBackground',
});
</script>

<style scoped>
.HomeContainer {
    @apply relative w-full bg-primary-light dark:bg-dark;
}
</style>
