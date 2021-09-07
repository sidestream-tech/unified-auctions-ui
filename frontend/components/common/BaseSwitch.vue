<template>
    <ASwitch class="BaseSwitch" :checked="isChecked" size="small" @click="$emit('update:isChecked', !isChecked)" />
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
.BaseSwitch.ant-switch {
    @apply h-3 w-5;
}
.BaseSwitch.ant-switch-small {
    min-width: 1px;
}
.BaseSwitch.ant-switch::after {
    @apply h-2 w-2;
}
.BaseSwitch.ant-switch-checked {
    @apply bg-primary-light;
}
.BaseSwitch.ant-switch:not(.BaseSwitch.ant-switch-checked) {
    @apply bg-gray-700;
}
</style>
