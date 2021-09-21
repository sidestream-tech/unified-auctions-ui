<template>
    <ASwitch class="BaseSwitch" :checked="isChecked" @click="$emit('update:isChecked', !isChecked)" />
</template>

<script lang="ts">
import Vue from 'vue';
import { Switch } from 'ant-design-vue';

export default Vue.extend({
    components: {
        ASwitch: Switch,
    },
    props: {
        isChecked: {
            type: Boolean,
            required: true,
        },
    },
});
</script>
<style scoped>
.BaseSwitch {
    @apply w-10 md:h-4 md:w-5;

    min-width: 28px;
}
.BaseSwitch::after {
    @apply md:h-3 md:w-3;
}
.BaseSwitch.ant-switch-checked {
    @apply bg-primary-light;
}
.BaseSwitch.ant-switch:not(.BaseSwitch.ant-switch-checked) {
    @apply bg-gray-700;
}
</style>
