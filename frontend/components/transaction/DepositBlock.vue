<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Deposit">
            To participate in auctions you need to sign the approval transactions below and move DAI that will be used
            for bidding to the VAT. This action allows the VAT to use the DAI you have deposited.
        </TextBlock>
        <div class="text-base font-medium mt-1">
            <div class="flex justify-between">
                <span>Amount available in the wallet</span>
                <format-currency v-if="walletDAI" :value="walletDAI" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Currently deposited amount</span>
                <format-currency v-if="vatDAI" :value="vatDAI" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Minimum to deposit</span>
                <format-currency v-if="minimumDepositDAI" :value="minimumDepositDAI" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
        </div>
        <div class="flex space-x-4 justify-end flex-wrap mt-3">
            <BaseButton :disabled="isDisabled" :is-loading="isLoading" class="w-60 mb-2" @click="$emit('manageVat')">
                Manage VAT
            </BaseButton>
            <BaseButton v-if="minimumDepositDAI && minimumDepositDAI.isZero()" disabled class="w-60">
                Enough DAI is available
            </BaseButton>
            <BaseButton
                v-else
                type="primary"
                :disabled="isDisabled"
                :is-loading="isLoading"
                class="w-60"
                @click="$emit('deposit', minimumDepositDAI)"
            >
                Deposit minimum amount
            </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BaseButton,
        FormatCurrency,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        walletDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        vatDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        transactionAmountDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
    },
    computed: {
        minimumDepositDAI(): BigNumber | undefined {
            if (!this.transactionAmountDAI || !this.vatDAI) {
                return undefined;
            }
            return BigNumber.maximum(0, this.transactionAmountDAI.minus(this.vatDAI));
        },
        isDisabled(): Boolean {
            return this.disabled || (!this.vatDAI && !this.walletDAI);
        },
    },
});
</script>
