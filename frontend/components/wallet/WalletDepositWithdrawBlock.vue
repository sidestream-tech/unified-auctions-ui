<template>
    <div class="WalletDepositWithDrawBlock">
        <TextBlock v-if="isExplanationsShown" title="Moving funds">
            The DAI funds can be moved freely between VAT and your wallet without any extra conversion. You only need
            to be aware that each transfer incurs transaction fees. Also, if you do not have DAI funds to deposit yet,
            there are several ways to obtain it:
            <ul class="list-disc list-inside">
                <li>
                    By borrowing DAI against a collateral in the
                    <a href="https://oasis.app/" target="_blank">oasis.app</a>
                </li>
                <li>
                    By purchasing it on a decentralized exchange like
                    <a href="https://uniswap.org/" target="_blank">uniswap.org</a> (correct DAI token address used on
                    the “mainnet” network is <FormatAddress type="address" :value="tokenAddressDAI" shorten />)
                </li>
            </ul>
        </TextBlock>
        <form class="flex flex-col gap-4" @submit.prevent="submit">
            <RadioGroup
                :disabled="isLoading"
                :value="selectedMethod"
                button-style="solid"
                class="flex items-center w-full"
                @change="handleMethodChange"
            >
                <RadioButton value="deposit" class="w-full text-center"> Deposit </RadioButton>
                <RadioButton value="withdraw" class="w-full text-center"> Withdraw </RadioButton>
            </RadioGroup>

            <BidInput
                v-if="selectedMethod === 'deposit'"
                key="depositInput"
                :amount-to-bid.sync="depositAmount"
                :disabled="isLoading || isSubmitting || maxDeposit === undefined || allowanceAmount === undefined"
                :total-price="maxAllowedDeposit"
                :minimum-deposit-dai="minimumDaiAmount"
            />
            <BidInput
                v-else
                key="withdrawInput"
                :amount-to-bid.sync="withDrawAmount"
                :disabled="isLoading || !isWithdrawingAllowed || isSubmitting || maxWithdraw === undefined"
                :total-price="maxWithdraw"
                :minimum-deposit-dai="minimumDaiAmount"
            />

            <BaseButton
                type="primary"
                class="capitalize"
                :is-loading="isSubmitting"
                :disabled="!canSubmit || isLoading"
                html-type="submit"
            >
                {{ selectedMethod }}
            </BaseButton>
        </form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Radio } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import TextBlock from '../common/TextBlock.vue';
import FormatAddress from '../utils/FormatAddress.vue';
import BaseButton from '../common/BaseButton.vue';
import BidInput from '../utils/BidInput';

export default Vue.extend({
    name: 'WalletDepositWithdrawBlock',
    components: {
        BidInput,
        BaseButton,
        FormatAddress,
        TextBlock,
        RadioGroup: Radio.Group,
        RadioButton: Radio.Button,
    },
    props: {
        isLoading: {
            type: Boolean,
            default: false,
        },
        isSubmitting: {
            type: Boolean,
            default: false,
        },
        maxDeposit: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        maxWithdraw: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        tokenAddressDAI: {
            type: String,
            required: true,
        },
        allowanceAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isWithdrawingAllowed: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            minimumDaiAmount: new BigNumber(0),
            selectedMethod: 'deposit',
            depositAmount: undefined,
            withDrawAmount: undefined,
        };
    },
    computed: {
        canSubmit(): boolean {
            if (this.selectedMethod === 'deposit') {
                if (this.maxDeposit === undefined || this.allowanceAmount === undefined) {
                    return false;
                }
                if (this.depositAmount === undefined) {
                    return true;
                }
                return !this.depositAmount.isNaN();
            }
            if (this.selectedMethod === 'withdraw') {
                if (this.maxWithdraw === undefined) {
                    return false;
                }
                if (!this.isWithdrawingAllowed) {
                    return false;
                }
                if (this.withDrawAmount === undefined) {
                    return true;
                }
                return !this.withDrawAmount.isNaN();
            }
            return false;
        },
        maxAllowedDeposit(): BigNumber {
            if (this.allowanceAmount.isGreaterThan(this.maxDeposit)) {
                return this.maxDeposit;
            }
            return this.allowanceAmount;
        },
    },
    methods: {
        handleMethodChange(e) {
            this.selectedMethod = e.target.value;
        },
        submit() {
            if (this.selectedMethod === 'deposit') {
                this.$emit('deposit', this.depositAmount ?? this.maxAllowedDeposit);
            }
            if (this.selectedMethod === 'withdraw') {
                this.$emit('withdraw', this.withDrawAmount ?? this.maxWithdraw);
            }
        },
    },
});
</script>

<style>
.WalletDepositWithDrawBlock {
    @apply flex flex-col gap-4;
}

.WalletDepositWithDrawBlock input {
    @apply text-right pr-14;
}
</style>
