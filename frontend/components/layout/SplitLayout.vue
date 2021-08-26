<template>
    <div class="w-full h-full relative">
        <div class="w-full h-full transition-all duration-500" :class="{ 'md:w-1/2': isShown }">
            <slot :isShown="isShown" />
        </div>
        <div
            v-if="isShown"
            class="absolute bg-gray-500 opacity-70 w-full h-full top-0 left-0"
            @click="closeSidePanel"
        />
        <transition name="slide">
            <div
                v-if="isShown"
                class="flex flex-row-reverse absolute w-full h-full overflow-hidden md:w-1/2 top-0 right-0"
            >
                <div class="relative bg-white h-full w-full w-full overflow-scroll shadow-xl">
                    <CloseIcon
                        class="absolute cursor-pointer top-0 right-0 w-5 h-5 mx-10 mt-5"
                        @click="closeSidePanel"
                    />
                    <slot name="side" />
                </div>
                <div class="w-10 h-full md:hidden" @click="closeSidePanel" />
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CloseIcon from '~/assets/icons/close.svg';

export default Vue.extend({
    components: {
        CloseIcon,
    },
    props: {
        isShown: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        closeSidePanel() {
            this.$emit('update:isShown', false);
        },
    },
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.5s ease;
}

.slide-enter,
.slide-leave-to {
    transform: translateX(100%);
}
</style>
