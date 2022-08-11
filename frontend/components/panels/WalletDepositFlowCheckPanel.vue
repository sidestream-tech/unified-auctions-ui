<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown && !isEnoughDeposited" class="mb-2">
            The amount of <format-currency :value="desiredAmount" :currency="currency" /> is not present in the VAT and
            needs to be deposited there before the participation can happen.
        </TextBlock>
        <WalletVATCheckPanel
            :is-correct.sync="isEnoughInWallet"
            :wallet-amount="walletAmount"
            :wallet-vat-amount="walletVatAmount"
            :desired-amount="desiredAmount"
            :network="network"
            :token-address="tokenAddress"
            :currency="currency"
            :disabled="disabled"
            :is-loading="isLoading"
            :is-explanations-shown="isExplanationsShown"
            @refresh="$emit('refresh')"
        />
        <AllowanceAmountCheckPanel
            :is-correct.sync="isAmountWithinAllowance"
            :allowance-amount="allowanceAmount"
            :desired-amount="minimumDepositAmount"
            :currency="currency"
            :is-loading="isLoading"
            :disabled="disabled || !isEnoughInWallet"
            :is-explanations-shown="isExplanationsShown"
            @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
        />
        <Button
            type="primary"
            class="w-full mt-2"
            :disabled="disabled || !isAmountWithinAllowance || !isEnoughInWallet || isEnoughDeposited"
            :is-loading="isLoading"
            @click="$emit('deposit', minimumDepositAmount)"
        >
            Deposit <format-currency :value="minimumDepositAmount" :currency="currency" class="ml-1" />
        </Button>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import Button from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import WalletVATCheckPanel from '~/components/panels/WalletVATCheckPanel.vue';
import AllowanceAmountCheckPanel from '~/components/panels/AllowanceAmountCheckPanel.vue';
export default Vue.extend({
    components: {
        Button,
        BasePanel,
        TextBlock,
        FormatCurrency,
        WalletVATCheckPanel,
        AllowanceAmountCheckPanel,
    },
    props: {
        walletAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        walletVatAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        desiredAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        allowanceAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        network: {
            type: String,
            default: undefined,
        },
        tokenAddress: {
            type: String,
            default: '',
        },
        currency: {
            type: String,
            default: 'DAI',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data: () => ({
        isAmountWithinAllowance: false,
        isEnoughInWallet: false,
    }),
    computed: {
        minimumDepositAmount(): BigNumber | undefined {
            if (!this.desiredAmount || !this.walletVatAmount) {
                return undefined;
            }
            return BigNumber.maximum(0, this.desiredAmount.minus(this.walletVatAmount));
        },
        isDesiredAmountValid(): boolean {
            return this.desiredAmount && !this.desiredAmount.isNaN();
        },
        isEnoughDeposited(): boolean {
            return this.minimumDepositAmount?.isZero() ?? false;
        },
        currentStateAndTitle(): PanelProps {
            if (!this.walletAmount) {
                return {
                    name: 'inactive',
                    title: 'Please connect a wallet',
                };
            }
            if (!this.isDesiredAmountValid) {
                return {
                    name: 'inactive',
                    title: 'Please enter the value to deposit first',
                };
            }
            if (this.desiredAmount.isLessThan(0)) {
                return {
                    name: this.disabled ? 'inactive' : 'incorrect',
                    title: 'The amount cannot be negative',
                };
            }
            if (!this.isEnoughDeposited) {
                return {
                    name: this.disabled ? 'inactive' : 'incorrect',
                    title: `The amount of ${this.currency} is not present in the VAT`,
                };
            }
            return {
                name: 'correct',
                title: `The amount of ${this.currency} is present in the VAT`,
            };
        },
    },
    watch: {
        currentStateAndTitle: {
            immediate: true,
            handler(newCurrentStateAndTitle) {
                this.$emit('update:isCorrect', newCurrentStateAndTitle.name === 'correct');
            },
        },
    },
});
</script>
