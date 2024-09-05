<template>
    <li v-if="option" class="w-full">
        <nuxt-link
            v-if="option.href"
            :key="option.value"
            :to="option.href"
            class="w-full flex hover:bg-primary px-4 py-2 cursor-pointer items-center hover:text-white"
            :class="option.classes"
        >
            <component :is="option.icon" v-if="option.icon" class="w-8 pr-3" />
            <span :class="option.value === value && 'font-bold'">
                {{ option.label }}
            </span>
        </nuxt-link>
        <div
            v-if="!option.href"
            :key="option.value"
            class="w-full flex hover:bg-primary px-4 py-2 cursor-pointer items-center hover:text-white"
            :class="option.classes"
            @click="$emit('input', option.value)"
        >
            <component :is="option.icon" v-if="option.icon" class="w-8 pr-3" />
            <span :class="option.value === value && 'font-bold'">
                {{ option.label }}
            </span>
        </div>
    </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'SelectOption',
    props: {
        option: {
            type: Object as Vue.PropType<SelectOption>,
            default: undefined,
        },
        value: {
            type: [String, Number],
            default: '',
        },
    },
});
</script>
