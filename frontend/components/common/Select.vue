<template>
    <div>
        <popover
            v-model="visible"
            class="hidden md:flex"
            trigger="hover"
            placement="bottomLeft"
            overlay-class-name="Select hidden md:flex"
        >
            <div slot="content" class="p-0">
                <ul>
                    <li
                        v-for="option in options"
                        :key="option.value"
                        class="w-full hover:bg-gray-200 px-4 py-2 cursor-pointer"
                        @click="updateInput(option.value)"
                    >
                        {{ option.label }}
                    </li>
                </ul>
            </div>
            <button class="flex items-center">
                <slot name="text-prefix" />
                <span class="hidden md:block">{{ selectedLabel }}</span>
                <slot name="text-suffix" />
            </button>
        </popover>
        <div class="md:hidden">
            <button class="flex items-center" @click="toggleModal">
                <slot name="text-prefix" />
                <slot name="text-suffix" />
            </button>
            <modal
                v-model="visible"
                :title="title"
                :footer="null"
                class="Select md:hidden"
                :dialog-style="{ top: '60px' }"
            >
                <ul>
                    <li
                        v-for="option in options"
                        :key="option.value"
                        class="w-full hover:bg-gray-200 px-4 py-2 cursor-pointer"
                        @click="updateInput(option.value)"
                    >
                        {{ option.label }}
                    </li>
                </ul>
            </modal>
        </div>
    </div>
</template>

<script lang="ts">
import { Popover, Modal } from 'ant-design-vue';
import Vue from 'vue';

export default Vue.extend({
    name: 'Select',
    components: {
        Popover,
        Modal,
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
        title: {
            type: String,
            default: 'Please select...',
        },
    },
    data() {
        return {
            visible: false,
            visibleModal: false,
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
            this.visible = false;
            this.$emit('input', value);
        },
        toggleModal(): void {
            this.visible = !this.visible;
        },
    },
});
</script>

<style>
.Select .ant-popover-inner-content {
    @apply p-0;
}

.Select .ant-modal-body {
    @apply px-0 py-3;
}

.Select .ant-modal-header {
    @apply p-3;
}

.Select .ant-modal-close {
    top: -7px;
}
</style>
