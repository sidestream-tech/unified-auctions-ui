<template>
    <modal :visible="isShown" :footer="null" class="my-0" title="Acceptance of Terms" destroy-on-close @cancel="close">
        <TextBlock class="py-3 px-6">
            Please read these <a :href="termsAndConditionsURL" target="_blank">Terms and Conditions </a> (this
            “Agreement”) carefully. Your use or access of the Site or the Services (as defined below) constitutes your
            consent to this Agreement.

            <div class="flex flex-col space-y-3 mt-5 mb-2">
                <checkbox v-model="checked">
                    <span class="font-bold">
                        I have read and accept the
                        <a :href="termsAndConditionsURL" target="_blank">Terms and Conditions</a>.
                    </span>
                </checkbox>
                <BaseButton type="primary" class="w-full" :disabled="!checked" @click="$emit('accept')">
                    Accept and continue
                </BaseButton>
            </div>
        </TextBlock>
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal, Checkbox } from 'ant-design-vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    name: 'TermsModal',
    components: { TextBlock, BaseButton, Modal, Checkbox },
    props: {
        isShown: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            checked: false,
        };
    },
    computed: {
        termsAndConditionsURL(): string {
            return this.$config?.TERMS_AND_CONDITIONS_URL || '';
        },
    },
    methods: {
        close() {
            this.checked = false;
            this.$emit('close');
        },
    },
});
</script>
