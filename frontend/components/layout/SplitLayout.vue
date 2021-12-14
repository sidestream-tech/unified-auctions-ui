<template>
    <div class="Container" :class="{ Step1: step === 1, Step2: step === 2 }">
        <div class="Slot0">
            <slot class="min-h-screen" name="step0" :step="step" />
            <div class="Overlay" @click="closeSidePanel" />
            <Footer />
        </div>

        <div class="Slot1">
            <div class="MobileSpace" @click="closeSidePanel" />
            <div class="SlotContainer">
                <CloseIcon class="CloseIcon" @click="closeSidePanel" />
                <slot name="step1" />
            </div>
            <div class="Overlay" @click="closeSidePanel" />
        </div>

        <div class="Slot2">
            <div class="MobileSpace" @click="closeSidePanel" />
            <div class="SlotContainer">
                <CloseIcon class="CloseIcon" @click="closeSidePanel" />
                <slot v-if="step !== 0" name="step2" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import CloseIcon from '~/assets/icons/close.svg';
import Footer from '~/components/layout/Footer.vue';

export default Vue.extend({
    components: {
        Footer,
        CloseIcon,
    },
    props: {
        step: {
            type: Number,
            default: 0,
        },
    },
    methods: {
        closeSidePanel() {
            this.$emit('update:step', this.step - 1 < 0 ? 0 : this.step - 1);
        },
    },
});
</script>

<style scoped>
/* DEFAULT STATE  */
.Container {
    @apply relative w-full h-full overflow-hidden;
}
.CloseIcon {
    @apply absolute hidden cursor-pointer top-0 right-0 w-10 h-10 p-2 mr-5 mt-5 z-40 fill-current dark:text-gray-200;
}
.Slot0 {
    @apply w-full h-full transition-all overflow-auto duration-500 relative;
}
.Slot1 {
    @apply absolute md:w-1/2 w-full h-full right-0 top-0 overflow-hidden transform translate-x-full transition-all duration-500 overscroll-none z-20;
}
.Slot2 {
    @apply absolute hidden md:w-1/2 w-full h-full right-0 top-0 overflow-hidden transition-all duration-500 z-30;
}
.SlotContainer {
    @apply relative w-full h-full bg-white dark:bg-gray-900 overflow-auto shadow-2xl md:shadow-none;
}
.Step1 .CloseIcon,
.Step2 .Slot2 .CloseIcon {
    @apply block;
}
.Overlay {
    @apply fixed w-full h-full inset-0 bg-gray-500 opacity-0 transition-all duration-500 hidden z-10;
}

/* STATE STEP 1 */
.Step1 .Slot0 {
    @apply md:w-1/2 px-4 overflow-hidden;
}
.Step1 .Slot1 {
    @apply flex transform-none md:shadow-2xl;
}
.Step1 .Slot2 {
    @apply flex transform translate-x-full;
}
.Step1 .Slot1 .CloseIcon {
    @apply block;
}
.Step1 .Slot0 .Overlay,
.Step2 .Slot0 .Overlay {
    @apply opacity-70 block transition-none;

    height: 300%;
}
.MobileSpace {
    @apply h-full w-10 md:hidden;
}

/* STATE STEP 2 */
.Step2 .Slot0 {
    @apply md:w-1/2 md:relative md:transform md:-translate-x-full overflow-hidden;
}
.Step2 .Slot1 {
    @apply flex transform md:-translate-x-full;
}
.Step2 .Slot2 {
    @apply flex transform-none md:shadow-2xl;
}
.Step2 .Slot1 .Overlay {
    @apply opacity-70 md:block;
}
</style>
