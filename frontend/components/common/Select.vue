<template>
    <popover v-model="visible" trigger="hover" placement="bottomLeft" overlay-class-name="Select">
        <div slot="content" class="p-0">
            <ul>
                <li
                    v-for="option in options"
                    :key="option.value"
                    class="w-full hover:bg-gray-200 px-4 py-2 cursor-pointer"
                    @click="$emit('input', option.value)"
                >
                    {{ option.label }}
                </li>
            </ul>
        </div>
        <button class="flex items-center">
            <slot name="text-prefix" />
            {{ selectedLabel }}
            <slot name="text-suffix" />
        </button>
    </popover>
</template>

<script lang="ts">
import { Popover } from 'ant-design-vue';
import Vue from 'vue';

export default Vue.extend({
    name: 'Select',
    components: {
        Popover,
    },
    props: {
        options: {
            type: Array as Vue.PropType<SelectOption[]>,
            default: () => [],
        },
        value: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            visible: false,
        };
    },
    computed: {
        selectedLabel(): string {
            const selectedOption = this.options.find(option => option.value === this.value);
            return selectedOption?.label || 'Please select...';
        },
    },
    methods: {
        updateInput(value: string): void {
            this.$emit('input', value);
        },
    },
});
</script>

<style>
.Select .ant-popover-inner-content {
    padding: 0;
}
</style>
