<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Deposit">
            To participate in the auction you need to deposit enough DAI to the VAT. Below is an overview on the
            current DAI balance in your wallet that can be used to make a deposit; the amount already deposited; and
            the minimum amount to deposit in order to participate in the auction based on the bid you want to make. You
            can directly deposit the minimum required amount of DAI if you don't have sufficient deposits yet.
        </TextBlock>
        <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100 mt-2">
            <div class="flex justify-between">
                <span>Amount available in the wallet</span>
                <format-currency v-if="walletDai" :value="walletDai" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Amount available in the VAT</span>
                <format-currency v-if="walletVatDai" :value="walletVatDai" currency="DAI" />
                <div v-else>
                    <span class="opacity-75">Unknown</span>
                    <span>DAI</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span>Minimum to deposit</span>
                <format-currency
                    v-if="minimumDepositDai && !transactionBidAmount.isNaN()"
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
            <BaseButton v-if="minimumDepositDai && minimumDepositDai.isZero()" disabled class="w-full md:w-80">
                Enough DAI is available
            </BaseButton>
            <BaseButton
                v-else
                type="primary"
                :disabled="isDisabled"
                class="w-full md:w-80"
                @click="$emit('manageVat')"
            >
                Manage DAI in VAT
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
        disabled: {
            type: Boolean,
            default: false,
        },
        walletDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        walletVatDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        transactionBidAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
    },
    computed: {
        minimumDepositDai(): BigNumber | undefined {
            if (!this.transactionBidAmount || !this.walletVatDai) {
                return undefined;
            }
            return BigNumber.maximum(0, this.transactionBidAmount.minus(this.walletVatDai));
        },
        isDisabled(): Boolean {
            return this.disabled || (!this.walletVatDai && !this.walletDai);
        },
    },
});
</script>
