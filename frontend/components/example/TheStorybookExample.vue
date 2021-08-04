<template>
    <div class="m-1 text-xs">
        <label class="block">Example input</label>
        <form @submit.prevent="$emit('submit', localValue)">
            <span class="relative">
                <input
                    v-model="localValue"
                    type="text"
                    class="border rounded p-1 outline-none"
                    :placeholder="placeholder"
                    autofocus
                />
                <Tooltip title="Clear the input by clicking here">
                    <CloseIcon
                        v-if="localValue"
                        class="absolute w-4 right-0 top-0 mr-2 cursor-pointer hover:bg-red-500"
                        @click="localValue = ''"
                    />
                </Tooltip>
            </span>
            <button type="submit" class="bg-blue-200 rounded p-1">Submit</button>
        </form>
        <div class="mt-2">
            <nuxt-link to="/">Example link</nuxt-link>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Tooltip } from 'ant-design-vue';
import CloseIcon from '~/assets/icons/close.svg';

export default Vue.extend({
    components: {
        Tooltip,
        CloseIcon,
    },
    props: {
        placeholder: {
            type: String,
            default: '',
        },
        value: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            localValue: this.value,
        };
    },
});
</script>
