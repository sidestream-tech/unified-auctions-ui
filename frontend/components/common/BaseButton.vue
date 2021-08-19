<template>
    <Button
        :disabled="disabled"
        :class="{
            'text-white bg-primary border-primary active:bg-primary-dark active:border-primary-dark  focus:bg-primary-light focus:border-primary-light hover:bg-primary-light hover:border-primary-light':
                type == 'primary',
        }"
        :type="type"
        @click="$emit('click')"
        ><slot
    /></Button>
</template>
<script lang="ts">
import Vue from 'vue';
import { Button } from 'ant-design-vue';

export default Vue.extend({
    components: {
        Button,
    },
    props: {
        type: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
