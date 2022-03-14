<template>
    <div>
        <Tooltip placement="topRight" :visible="showError">
            <div slot="title">
                <span class="text-red-400"> Your vault does not contain enough DAI. </span>
            </div>
            <div class="relative">
                <InputNumber
                    :value="value"
                    :disabled="disabled"
                    class="w-full"
                    :formatter="input => `${input}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    @change="onChange"
                />
                <div class="absolute right-7 top-0 h-full flex flex-col justify-center">
                    <p :class="disabled && 'opacity-40'" class="p-0 font-bold">DAI</p>
                </div>
            </div>
        </Tooltip>
        <div class="text-right">
            <BaseButton :disabled="disabled" type="link" @click="onChange(max)"> Max </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import { InputNumber, Tooltip } from 'ant-design-vue';
import Vue from 'vue';
import BaseButton from '../common/BaseButton.vue';

export default Vue.extend({
    name: 'WalletDAIInput',
    components: { BaseButton, InputNumber, Tooltip },
    props: {
        value: {
            type: Number,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        max: {
            type: Number,
            default: 0,
        },
        defaultValue: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            showError: false,
        };
    },
    methods: {
        onChange(newValue) {
            if (!newValue) {
                this.$emit('update', 0);
                this.showError = false;
                return;
            }
            if (newValue === '-') {
                this.$emit('update', -0);
                this.showError = true;
                return;
            }
            this.showError = newValue < 0 || newValue > this.max;
            this.$emit('update', parseFloat(newValue));
        },
    },
});
</script>
