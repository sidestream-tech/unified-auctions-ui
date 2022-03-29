<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Access to DAI">
            To bid on an auction with DAI, first funds need to be deposited to the
            <Explain text="VAT">
                The
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation#2-contract-details"
                    >VAT contract</a
                >
                is the core vault engine of the Maker Protocol and manages the central accounting invariants of DAI.
                Depositing and interacting with the VAT is necessary in order to participate in auctions. </Explain
            >. The following transaction authorizes the wallet address to deposit into the VAT. It is a prerequisite to
            participate in the auction.
        </TextBlock>
        <div class="my-2 flex justify-between">
            <div>Current allowance</div>
            <div>
                <span v-if="isUnlimitedAllowance">Unlimited DAI</span>
                <FormatCurrency v-else :value="allowanceAmount" currency="DAI" />
            </div>
        </div>
        <div class="flex flex-row-reverse">
            <BaseButton
                v-if="!isDaiAccessGranted"
                class="w-full md:w-80"
                type="primary"
                :disabled="disabled"
                :is-loading="isLoading"
                @click="$emit('grantAccess')"
            >
                Set unlimited DAI allowance
            </BaseButton>
            <BaseButton v-else disabled class="w-full md:w-80">Access to DAI was granted</BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import Explain from '~/components/utils/Explain.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BaseButton,
        Explain,
        FormatCurrency,
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
        allowanceAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
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
    computed: {
        isUnlimitedAllowance() {
            return this.allowanceAmount?.toFixed(0).length > 50 ?? false;
        },
    },
});
</script>
