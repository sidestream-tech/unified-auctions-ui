<template>
    <label class="BaseSwitch relative flex items-center cursor-pointer">
        <input type="checkbox" class="sr-only" :checked="isChecked" @change="$emit('update:isChecked', !isChecked)" />
        <span class="rail block bg-gray-600 w-10 h-6 md:w-8 md:h-5 rounded-full" />
        <span class="dot absolute left-1 top-1 bg-white w-4 h-4 md:w-3 md:h-3 rounded-full transition" />
    </label>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        isChecked: {
            type: Boolean,
            required: true,
        },
    },
});
</script>
<style scoped>
.BaseSwitch input:checked ~ .dot {
    @apply bg-white;

    transform: translateX(100%);
}

.BaseSwitch input:checked ~ .rail {
    @apply bg-primary-light;
}
</style>
