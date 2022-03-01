<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Allow access to DAI">
            This action allows you to deposit DAI into the
            <Explain text="VAT">
                The
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation#2-contract-details"
                >
                    VAT contract
                </a>
                is the core vault engine of the Maker Protocol and manages the central accounting invariants of DAI.
                Depositing and interacting with the VAT is necessary in order to participate in auctions.
            </Explain>
            . The following transaction authorizes the wallet address to deposit into the VAT. It is a prerequisite to
            participate in the auction.
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <BaseButton
                v-if="!isDaiAccessGranted"
                type="primary"
                :disabled="disabled"
                :is-loading="isLoading"
                @click="$emit('grantAccess')"
            >
                Allow access to DAI
            </BaseButton>
            <BaseButton v-else disabled>Access to DAI was granted</BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BaseButton,
        Explain,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isDaiAccessGranted: {
            type: Boolean,
            required: true,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
});
</script>
