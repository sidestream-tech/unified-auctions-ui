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
                    the “{{ networkTitle }}” network is
                    <FormatAddress type="address" :value="tokenAddressDai || ''" shorten />)
                </li>
            </ul>
        </TextBlock>
        <form class="flex flex-col gap-4" @submit.prevent="submit">
            <RadioGroup
                :disabled="isLoading"
                :value="selectedMethod"
                class="flex items-center w-full"
                @change="handleMethodChange"
            >
                <RadioButton value="deposit" class="w-full text-center"> Deposit </RadioButton>
                <RadioButton value="withdraw" class="w-full text-center"> Withdraw </RadioButton>
            </RadioGroup>

            <BidInput
                v-show="selectedMethod === 'deposit'"
                :amount-to-bid.sync="depositAmount"
                :disabled="!canDeposit"
                :total-price="maxAllowedDeposit"
                :minimum-deposit-dai="minimumDaiAmount"
            />
            <BidInput
                v-show="selectedMethod === 'withdraw'"
                :amount-to-bid.sync="withDrawAmount"
                :disabled="!canWithdraw"
                :total-price="maxWithdraw"
                :minimum-deposit-dai="minimumDaiAmount"
            />

            <BaseButton type="primary" :is-loading="isSubmitting" :disabled="!canSubmit" html-type="submit">
                <span class="capitalize">{{ selectedMethod }}{{ isSubmitting ? 'ing...' : '' }}</span>
            </BaseButton>
        </form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Radio } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
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
        network: {
            type: String,
            default: undefined,
        },
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
        tokenAddressDai: {
            type: String,
            default: undefined,
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
        canDeposit() {
            return (
                !this.isLoading &&
                !this.isSubmitting &&
                this.allowanceAmount !== undefined &&
                BigNumber.isBigNumber(this.maxDeposit) &&
                !this.maxDeposit.isZero()
            );
        },
        canWithdraw() {
            return (
                !this.isLoading &&
                !this.isSubmitting &&
                this.isWithdrawingAllowed &&
                BigNumber.isBigNumber(this.maxWithdraw) &&
                !this.maxWithdraw.isZero()
            );
        },
        canSubmit(): boolean {
            if (this.selectedMethod === 'deposit') {
                if (!this.canDeposit) {
                    return false;
                }
                if (this.depositAmount === undefined) {
                    return true;
                }
                return !this.depositAmount.isNaN();
            }
            if (this.selectedMethod === 'withdraw') {
                if (!this.canWithdraw) {
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
        networkTitle(): string {
            try {
                return getNetworkConfigByType(this.network).title;
            } catch {
                return this.network;
            }
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
