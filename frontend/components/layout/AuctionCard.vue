<template>
    <div class="w-full overflow-hidden rounded-lg hover:border-primary border-2 border-transparent flex flex-col">
        <div class="CardSection bg-primary-light dark:bg-primary-dark">
            <h3 class="text-white dark:text-gray-100 font-semibold text-xl">{{ title }}</h3>
        </div>
        <div
            class="
                CardSection
                flex flex-col flex-grow
                justify-between
                gap-y-6
                bg-white
                dark:bg-gray-800
                text-gray-700
                dark:text-gray-100
            "
        >
            <p>{{ content }}</p>
            <slot />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        title: {
            type: String,
            default: 'Collateral auctions',
        },
        content: {
            type: String,
            default: undefined,
        },
    },
});
</script>
<style scoped>
.CardSection {
    @apply px-5 py-6 sm:p-7;
}
</style>
