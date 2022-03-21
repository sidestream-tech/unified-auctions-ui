<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Deposit" class="mb-1">
            To participate in the auction you need to deposit enough DAI to the VAT. Below is an overview on the
            current DAI balance in your wallet that can be used to make a deposit; the amount already deposited; and
            the minimum amount to deposit in order to participate in the auction based on the bid you want to make. You
            can directly deposit the minimum required amount of DAI if you don't have sufficient deposits yet.
        </TextBlock>
        <div class="text-base font-medium">
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
                <format-currency v-if="walletVatDAI" :value="walletVatDAI" currency="DAI" />
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
            <BaseButton :disabled="isDisabled || isLoading" class="w-60 mb-2" @click="$emit('manageVat')">
                Manage DAI in VAT
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
        walletVatDAI: {
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
            if (!this.transactionAmountDAI || !this.walletVatDAI) {
                return undefined;
            }
            return BigNumber.maximum(0, this.transactionAmountDAI.minus(this.walletVatDAI));
        },
        isDisabled(): Boolean {
            return this.disabled || (!this.walletVatDAI && !this.walletDAI);
        },
    },
});
</script>
