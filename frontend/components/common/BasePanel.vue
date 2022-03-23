<template>
    <modal :visible="true" :mask-closable="false" :closable="false" :footer="null">
        <!-- Default Base Panel -->
        <div v-if="state === 'default'">
            <div class="p-5 gap-5 text-lg font-bold break-words"><slot /></div>
        </div>
        <!-- Inactive Base Panel -->
        <div v-if="state === 'inactive'">
            <div class="p-5 gap-5 text-lg font-bold text-gray-500 break-words">
                <slot />
            </div>
        </div>
        <!-- Incorrect Base Panel -->
        <div v-if="state === 'incorrect'">
            <div class="p-5 gap-5 text-lg font-bold text-red-500 break-words">
                <slot />
            </div>
            <div class="border-solid border-2 p-5 gap-5">
                <div class="grid grid-cols-2">
                    <span>Amount in wallet:</span>
                    <span>100 DAI</span>
                </div>
                <div>lorem ipsum</div>
                <div class="flex justify-end p-5 gap-5">
                    <BaseButton type="primary">Click here</BaseButton>
                </div>
            </div>
        </div>
        <!-- Complete Base Panel -->
        <div v-if="state === 'complete'">
            <div class="p-5 gap-5 text-lg font-bold text-gray-500 break-words">
                <slot />
            </div>
            <div class="border-solid border-2 p-5 gap-5">All good</div>
        </div>
        <!-- Notice Base Panel -->
        <div v-if="state === 'notice'">
            <div class="p-5 gap-5 text-lg font-bold text-yellow-500 break-words">
                <slot />
            </div>
            <div class="border-solid border-2 p-5 gap-5">Lorem ipsum...</div>
        </div>
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal } from 'ant-design-vue';
import BaseButton from './BaseButton.vue';

export default Vue.extend({
    name: 'BasePanel',
    components: { Modal, BaseButton },
    props: {
        state: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        walletAdress: {
            type: String,
            required: true,
        },
    },
});
</script>
