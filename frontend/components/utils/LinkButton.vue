<template>
    <component :is="isLocalLink ? 'nuxt-link' : 'a'" :href="link" :to="link" :target="linkTarget">
        <button
            :type="type"
            :class="{ Primary: type === 'primary', Secondary: type === 'secondary' }"
            class="rounded-full"
        >
            <div class="flex items-center px-2 my-0.5">
                <slot /> <ExternalLink class="w-5 h-5 ml-0.5 -mr-0.5 fill-current" />
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
.Primary {
    @apply bg-primary-light border-2 border-primary hover:text-primary text-gray-700;
}

.Secondary {
    @apply border-2 border-gray-300 text-gray-700 hover:text-gray-400 dark:text-gray-200 dark:hover:text-gray-400;
}
</style>
