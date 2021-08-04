<template>
    <div>
        <div v-if="title" class="text-xl font-extrabold mb-4 text-gray-700">{{ title }}</div>
        <slot />
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: '',
        },
    },
};
</script>
