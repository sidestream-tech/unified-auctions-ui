<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Deposit">
            To participate in the auction you need to deposit enough DAI to the VAT. Below is an overview on the
            current DAI balance in your wallet that can be used to make a deposit; the amount already deposited; and
            the minimum amount to deposit in order to participate in the auction based on the bid you want to make. You
            can directly deposit the minimum required amount of DAI if you don't have sufficient deposits yet.
        </TextBlock>
        <div class="text-base font-medium text-gray-700 dark:text-gray-100 mt-1">
            <div class="flex justify-between">
                <span>Amount available in the wallet</span>
                <format-currency v-if="walletDai" :value="walletDai" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Currently deposited amount</span>
                <format-currency v-if="walletVatDai" :value="walletVatDai" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Minimum to deposit</span>
                <format-currency
                    v-if="minimumDepositDai && !transactionAmountDai.isNaN()"
                    :value="minimumDepositDai"
                    currency="DAI"
                />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
        </div>
        <div class="flex space-x-4 justify-end flex-wrap mt-3">
            <!--
            <BaseButton :disabled="isDisabled || isLoading" class="w-60 mb-2" @click="$emit('manageVat')">
                Manage VAT
            </BaseButton>
            -->
            <BaseButton v-if="minimumDepositDai && minimumDepositDai.isZero()" disabled class="w-full md:w-80">
                Enough DAI is available
            </BaseButton>
            <BaseButton v-else-if="minimumDepositDai && !isEnoughDaiInWallet" disabled class="w-full md:w-80">
                Not Enough DAI in wallet
            </BaseButton>
            <BaseButton
                v-else
                type="primary"
                :disabled="isDisabled"
                :is-loading="isLoading"
                class="w-full md:w-80"
                @click="$emit('deposit', minimumDepositDai)"
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
        walletDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletVatDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        transactionAmountDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
    },
    computed: {
        minimumDepositDai(): BigNumber | undefined {
            if (!this.transactionAmountDai || !this.walletVatDai) {
                return undefined;
            }
            return BigNumber.maximum(0, this.transactionAmountDai.minus(this.walletVatDai));
        },
        isDisabled(): Boolean {
            return this.disabled || (!this.walletVatDai && !this.walletDai);
        },
        isEnoughDaiInWallet(): Boolean {
            if (this.minimumDepositDai) {
                return this.walletDai.isGreaterThanOrEqualTo(this.minimumDepositDai);
            }
            return true;
        },
    },
});
</script>
