<template>
    <div class="BasePanel">
        <template v-for="state of STATES">
            <button
                v-if="$slots[state.name]"
                :key="state.name"
                class="Title"
                type="button"
                :class="titleClass(state.name)"
                @click="isExpanded = !isExpanded"
            >
                <div class="Icon" :class="iconClass(state.name)">
                    <Icon v-if="state.name === 'inactive'" type="close" />
                    <Icon v-else-if="state.name === 'incorrect'" type="warning" theme="filled" />
                    <Icon v-else-if="state.name === 'correct'" type="check" />
                    <Icon v-else-if="state.name === 'notice'" type="warning" theme="filled" />
                </div>
                <slot :name="state.name">{{ $props[state.name] }}</slot>
            </button>
        </template>
        <div v-show="isExpanded" class="Content">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';

const STATES = [
    {
        name: 'inactive',
        titleClass: 'text-gray-400',
        iconClass: 'text-gray-400',
        isExpanded: false,
    },
    {
        name: 'incorrect',
        titleClass: 'text-red-500',
        iconClass: 'text-red-500',
        isExpanded: true,
    },
    {
        name: 'correct',
        titleClass: 'text-gray-400',
        iconClass: 'text-green-500',
        isExpanded: false,
    },
    {
        name: 'notice',
        titleClass: 'text-yellow-500',
        iconClass: 'text-yellow-500',
        isExpanded: true,
    },
];

export default Vue.extend({
    components: {
        Icon,
    },
    props: {
        ...STATES.reduce(
            (props, state) => ({
                ...props,
                [state.name]: {
                    type: String,
                    default: '',
                },
            }),
            {}
        ),
    },
    data() {
        return {
            STATES,
            isExpanded: false,
        };
    },
    watch: {
        currentState: {
            immediate: true,
            handler(newState: string): void {
                this.isExpanded = STATES.filter(s => s.isExpanded)
                    .map(s => s.name)
                    .includes(newState);
            },
        },
    },
    methods: {
        titleClass(stateName: string): string | undefined {
            return STATES.find(s => s.name === stateName)?.titleClass;
        },
        iconClass(stateName: string): string | undefined {
            return STATES.find(s => s.name === stateName)?.iconClass;
        },
    },
});
</script>

<style scoped>
.BasePanel {
    @apply flex flex-col;
    @apply border-2 border-gray-300 dark:border-gray-600 dark:text-gray-200;
}
.BasePanel:first-child {
    @apply rounded-t;
}
.BasePanel:last-child {
    @apply rounded-b;
}
.BasePanel:only-child {
    @apply rounded;
}
.BasePanel + .BasePanel {
    margin-top: -1px;
}
.Title {
    @apply px-2 py-1 text-left;
}
.Icon {
    @apply inline;
}
.Content {
    @apply px-3 py-1;
}
</style>
