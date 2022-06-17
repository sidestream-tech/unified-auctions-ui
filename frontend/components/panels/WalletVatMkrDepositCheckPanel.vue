<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <WalletMkrDepositCheckPanel
            :is-correct.sync="isEnoughMkrInWallet"
            :wallet-mkr="walletMkr"
            :wallet-vat-mkr="walletVatMkr"
            :desired-amount="desiredAmount"
            :network="network"
            :token-address-mkr="tokenAddressMkr"
            :disabled="disabled"
            :is-loading="isLoading"
            :is-explanations-shown="isExplanationsShown"
            @refresh="$emit('refresh')"
        />
        <AllowanceAmountCheckPanel
            :is-correct.sync="isAmountWithinAllowance"
            :allowance-amount="allowanceAmount"
            :desired-amount="desiredAmount"
            currency="MKR"
            :is-loading="isLoading"
            :disabled="disabled || !isEnoughMkrInWallet"
            :is-explanations-shown="isExplanationsShown"
            @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
        />
        <TextBlock v-if="isExplanationsShown && !isEnoughDeposited" class="mt-2">
            The amount of <format-currency :value="desiredAmount" currency="MKR" /> is not present in the VAT and needs
            to be deposited there before the participation can happen.
        </TextBlock>
        <Button
            type="primary"
            class="w-full mt-2"
            :disabled="disabled || !isAmountWithinAllowance || !isEnoughMkrInWallet || isEnoughDeposited"
            :is-loading="isLoading"
            @click="$emit('deposit')"
        >
            Deposit <format-currency :value="desiredAmount" currency="MKR" class="ml-1" />
        </Button>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import Button from '~/components/common/BaseButton.vue';
import BasePanel from '~/components/common/BasePanel.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import WalletMkrDepositCheckPanel from '~/components/panels/WalletMkrDepositCheckPanel.vue';
import AllowanceAmountCheckPanel from '~/components/panels/AllowanceAmountCheckPanel.vue';

export default Vue.extend({
    components: {
        Button,
        BasePanel,
        TextBlock,
        FormatCurrency,
        WalletMkrDepositCheckPanel,
        AllowanceAmountCheckPanel,
    },
    props: {
        walletMkr: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        walletVatMkr: {
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
        tokenAddressMkr: {
            type: String,
            default: '',
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
        isEnoughMkrInWallet: false,
    }),
    computed: {
        isDesiredAmountValid(): boolean {
            return this.desiredAmount && !this.desiredAmount.isNaN();
        },
        isEnoughDeposited(): boolean {
            if (!this.walletVatMkr || !this.isDesiredAmountValid || this.desiredAmount.isLessThan(0)) {
                return false;
            }
            return this.desiredAmount.isLessThan(this.walletVatMkr);
        },
        currentStateAndTitle(): PanelProps {
            if (!this.walletMkr) {
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
                    name: 'incorrect',
                    title: 'The amount can not be negative',
                };
            }
            if (!this.isEnoughDeposited) {
                return {
                    name: 'incorrect',
                    title: 'The amount of MKR is not present in the VAT',
                };
            }
            return {
                name: 'correct',
                title: 'The amount of MKR is present in the VAT',
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
