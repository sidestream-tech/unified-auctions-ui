<template>
    <footer class="Footer">
        <ul
            class="
                flex flex-col
                md:flex-row
                items-center
                space-y-2 space-x-0
                md:space-y-0 md:space-x-10
                justify-center
            "
        >
            <li>
                <NuxtLink class="FooterLink" to="/terms"> Terms & Conditions </NuxtLink>
            </li>
            <li>
                <a class="FooterLink" :href="githubURL" target="_blank">Source Code</a>
            </li>
            <li v-if="contactEmail">
                <a class="FooterLink" :href="`mailto:${contactEmail}?subject=Issue on AuctionsUI`" target="_blank"
                    >Report a Problem</a
                >
            </li>
            <li class="flex items-center space-x-4">
                <span class="FooterLink">Keep in touch:</span>
                <a href="https://github.com/sidestream-tech" target="_blank"><icon type="github" class="text-xl" /></a>
                <a href="https://twitter.com/MakerDAO_SAS" target="_blank"><icon type="twitter" class="text-xl" /></a>
            </li>
        </ul>
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';

export default Vue.extend({
    name: 'Footer',
    components: { Icon },
    computed: {
        contactEmail(): string | undefined {
            return process.env.CONTACT_EMAIL;
        },
        githubURL(): string | undefined {
            return process.env.GITHUB_URL;
        },
    },
});
</script>

<style scoped>
.Footer {
    @apply opacity-75 bg-gray-100 w-full py-4 mt-8 dark:bg-gray-800;
}

.Footer .FooterLink {
    @apply dark:text-gray-100;
}

.Footer a {
    @apply dark:text-gray-100 dark:hover:text-primary;
}
</style>
