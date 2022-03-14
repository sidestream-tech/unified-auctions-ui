<template>
    <div class="WalletDepositWithDrawBlock">
        <TextBlock v-if="isExplanationsShown" title="Moving funds">
            The DAI funds can be moved freely between VAT and your wallet without any extra conversion. You only need
            to be aware that each transfer incurs transaction fees. Also, if you do not have DAI funds to deposit yet,
            there are several ways to obtain it:
            <ul class="list-disc list-inside">
                <li>By borrowing DAI against a collateral in the oasis.app</li>
                <li>
                    By purchasing it on a decentralized exchange like uniswap.org (correct DAI token address used on
                    the “mainnet” network is
                    <FormatAddress type="address" value="0x6b175474e89094c44da98b954eedeac495271d0f" shorten />)
                </li>
            </ul>
        </TextBlock>
        <div>
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
        </div>

        <WalletDAIInput
            v-if="selectedMethod === 'deposit'"
            :value="depositAmount"
            :disabled="isLoading"
            :max="maxDeposit"
            @update="setDepositAmount"
        />
        <WalletDAIInput
            v-else
            :value="withDrawAmount"
            :disabled="isLoading"
            :max="maxWithdraw"
            @update="setWithdrawAmount"
        />

        <BaseButton type="primary" class="capitalize" :disabled="isLoading || !canSubmit" @click="submit">
            {{ selectedMethod }}
        </BaseButton>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Radio } from 'ant-design-vue';
import TextBlock from '../common/TextBlock.vue';
import FormatAddress from '../utils/FormatAddress.vue';
import BaseButton from '../common/BaseButton.vue';
import WalletDAIInput from './WalletDAIInput.vue';

export default Vue.extend({
    name: 'WalletDepositWithdrawBlock',
    components: {
        WalletDAIInput,
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
        maxDeposit: {
            type: Number,
            default: 0,
        },
        maxWithdraw: {
            type: Number,
            default: 0,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            selectedMethod: 'deposit',
            depositAmount: 0,
            withDrawAmount: 0,
        };
    },
    computed: {
        canSubmit(): boolean {
            if (this.selectedMethod === 'deposit') {
                return this.depositAmount > 0 && this.depositAmount <= this.maxDeposit;
            }
            if (this.selectedMethod === 'withdraw') {
                return this.withDrawAmount > 0 && this.withDrawAmount <= this.maxWithdraw;
            }
            return false;
        },
    },
    methods: {
        handleMethodChange(e) {
            this.selectedMethod = e.target.value;
        },
        setDepositAmount(amount) {
            this.depositAmount = amount;
        },
        setWithdrawAmount(amount) {
            this.withDrawAmount = amount;
        },
        submit() {
            if (this.selectedMethod === 'deposit') {
                this.$emit('submit', { type: this.selectedMethod, amount: this.depositAmount });
            }
            if (this.selectedMethod === 'withdraw') {
                this.$emit('submit', { type: this.selectedMethod, amount: this.withDrawAmount });
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
