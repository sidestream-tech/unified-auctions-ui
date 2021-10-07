<template>
    <div>
        <popover
            v-model="localVisible"
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
                        class="w-full flex hover:bg-primary px-4 py-2 cursor-pointer items-center"
                        :class="option.classes"
                        @click="$emit('input', option.value)"
                    >
                        <component :is="option.icon" v-if="option.icon" class="w-8 pr-3" />
                        {{ option.label }}
                    </li>
                </ul>
            </div>
            <button class="flex items-center">
                <slot name="text-prefix" />
                <span class="hidden md:block"
                    ><slot name="title">{{ selectTitle }}</slot></span
                >
                <slot name="text-suffix" />
            </button>
        </popover>
        <div class="md:hidden">
            <button class="flex items-center" @click="toggleModal">
                <slot name="text-prefix" />
                <slot name="text-suffix" />
            </button>
            <modal
                v-model="localVisible"
                :title="title"
                :footer="null"
                class="Select md:hidden"
                :dialog-style="{ top: '60px' }"
            >
                <ul>
                    <li
                        v-for="option in options"
                        :key="option.value"
                        class="w-full hover:bg-primary px-4 py-2 cursor-pointer flex items-center"
                        @click="updateInput(option.value)"
                    >
                        <component :is="option.icon" v-if="option.icon" class="w-8 h-8 pr-3" />
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
            type: [String, Number],
            default: '',
        },
        title: {
            type: String,
            default: 'Please select...',
        },
        showJustTitle: {
            type: Boolean,
            default: false,
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            localVisible: false,
        };
    },
    computed: {
        selectTitle(): string {
            const selectedOption = this.options.find(option => option.value === this.value);
            if (this.showJustTitle || !selectedOption) {
                return this.title;
            }
            return selectedOption.label;
        },
    },
    watch: {
        localVisible: {
            handler(newVisible) {
                this.$emit('update:visible', newVisible);
            },
        },
        visible: {
            handler(newVisible) {
                this.localVisible = newVisible;
            },
        },
    },
    methods: {
        updateInput(value: string): void {
            this.localVisible = false;
            this.$emit('input', value);
        },
        toggleModal(): void {
            this.localVisible = !this.localVisible;
        },
    },
});
</script>

<style>
.Select .ant-popover-inner-content {
    @apply p-0 relative z-10 !important;
}

.Select .ant-modal-body {
    @apply px-0 py-3 !important;
}

.Select .ant-modal-header {
    @apply p-3 !important;
}

.Select .ant-modal-close {
    top: -7px !important;
}
</style>
