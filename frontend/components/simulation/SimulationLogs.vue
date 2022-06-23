<template>
    <Collapse v-if="logs.length > 0" :bordered="false" class="Collapse">
        <CollapsePanel key="1" class="CollapsePanel">
            <template #header>
                <TextBlock class="truncate">{{ logs[0] }}</TextBlock>
            </template>
            <div
                class="
                    font-mono
                    text-xs
                    flex flex-col
                    gap-2
                    bg-gray-800
                    text-white
                    p-2
                    rounded
                    max-h-60
                    overflow-y-auto
                "
            >
                <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
            </div>
        </CollapsePanel>
    </Collapse>
</template>

<script lang="ts">
import Vue from 'vue';
import { Collapse } from 'ant-design-vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        Collapse,
        CollapsePanel: Collapse.Panel,
        TextBlock,
    },
    props: {
        logs: {
            type: Array as Vue.PropType<string[]>,
            default: () => [],
        },
    },
});
</script>

<style scoped>
.CollapsePanel {
    @apply border-b-0 bg-white dark:bg-gray-900;
}

.CollapsePanel >>> .ant-collapse-header {
    @apply py-0 pl-6;
}

.CollapsePanel >>> .ant-collapse-arrow {
    @apply left-2 !important dark:text-gray-200;
}
</style>
