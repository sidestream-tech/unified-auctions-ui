<template>
    <div class="TextBlock">
        <h3 v-if="title || $slots.title" class="text-xl font-extrabold mb-1 text-gray-700">
            {{ title }}<slot name="title" />
        </h3>
        <slot />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    props: {
        title: {
            type: String,
            default: '',
        },
    },
});
</script>

<style scoped>
.TextBlock >>> a:link {
    @apply text-primary underline;
}
.TextBlock >>> a:hover {
    @apply text-primary-light no-underline;
}
.TextBlock >>> a:visited {
    @apply text-primary;
}
.TextBlock >>> a:visited:hover {
    @apply text-primary-light no-underline;
}
</style>
