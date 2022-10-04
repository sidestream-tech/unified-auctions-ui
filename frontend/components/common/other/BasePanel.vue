<template>
    <div class="BasePanel">
        <button class="Title" type="button" :class="titleClass" @click="isExpanded = !isExpanded">
            <div class="Icon" :class="iconClass">
                <Icon v-if="currentState === 'inactive'" type="close" />
                <Icon v-else-if="currentState === 'incorrect'" type="warning" theme="filled" />
                <Icon v-else-if="currentState === 'attention'" type="exclamation-circle" theme="filled" />
                <Icon v-else-if="currentState === 'correct'" type="check" />
                <Icon v-else-if="currentState === 'notice'" type="info-circle" theme="filled" />
            </div>
            <slot name="title" />
        </button>
        <CollapseTransition>
            <div v-show="isExpanded" class="Content">
                <slot />
            </div>
        </CollapseTransition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';
import CollapseTransition from '@ivanv/vue-collapse-transition';

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
        name: 'attention',
        titleClass: 'text-orange-500',
        iconClass: 'text-orange-500',
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
        titleClass: 'text-gray-400',
        iconClass: 'text-gray-400',
        isExpanded: true,
    },
];

export default Vue.extend({
    components: {
        Icon,
        CollapseTransition,
    },
    props: {
        currentState: {
            type: String,
            required: true,
            validator: (value: string) => STATES.map(s => s.name).includes(value),
        },
    },
    data() {
        return {
            isExpanded: false,
        };
    },
    computed: {
        titleClass(): string | undefined {
            return STATES.find(s => s.name === this.currentState)?.titleClass;
        },
        iconClass(): string | undefined {
            return STATES.find(s => s.name === this.currentState)?.iconClass;
        },
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
    margin-top: -2px;
}
.Title {
    @apply px-2 py-1 text-left;
}
.Icon {
    @apply inline;
}
.Content {
    @apply px-3 pt-1 pb-3;
}
</style>
