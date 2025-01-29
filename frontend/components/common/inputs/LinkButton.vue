<template>
    <component :is="isLocalLink ? 'nuxt-link' : 'a'" :href="link" :to="link" :target="linkTarget">
        <button
            :type="type"
            :class="{ Primary: type === 'primary', Secondary: type === 'secondary' }"
            class="rounded-full"
        >
            <div class="flex items-center px-4 my-1.5 font-semibold">
                <slot /> <ExternalLink v-if="!isLocalLink" class="w-5 h-5 ml-0.5 -mr-0.5 fill-current" />
            </div>
        </button>
    </component>
</template>

<script lang="ts">
import Vue from 'vue';
import ExternalLink from '~/assets/icons/external-link.svg';

export default Vue.extend({
    components: {
        ExternalLink,
    },
    props: {
        link: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            default: 'primary',
        },
    },
    computed: {
        isLocalLink(): boolean {
            return this.link.startsWith('/');
        },
        linkTarget(): string | undefined {
            return !this.isLocalLink && '_blank';
        },
    },
});
</script>

<style scoped>
button {
    @apply text-gray-700 dark:text-gray-200 transition duration-300;
}
.Primary {
    @apply bg-primary-light bg-opacity-80 hover:bg-opacity-100;
}
.Secondary {
    @apply bg-gray-200 dark:bg-opacity-60 bg-opacity-80 hover:bg-opacity-100;
}
</style>
