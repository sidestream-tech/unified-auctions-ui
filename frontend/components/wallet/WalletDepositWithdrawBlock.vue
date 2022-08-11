<template>
    <div class="WalletDepositWithDrawBlock">
        <TextBlock v-if="isExplanationsShown" title="Moving funds">
            The DAI funds can be moved freely between VAT and your wallet without any extra conversion. You only need
            to be aware that each transfer incurs transaction fees.
        </TextBlock>
        <form class="flex flex-col gap-4" @submit.prevent="submit">
            <RadioGroup
                :disabled="isLoading || isSubmitting || isAllowanceAmountLoading || isAuthorizationLoading"
                :value="selectedMethod"
                class="flex items-center w-full"
                @change="handleMethodChange"
            >
                <RadioButton value="deposit" class="w-full text-center"> Deposit </RadioButton>
                <RadioButton value="withdraw" class="w-full text-center"> Withdraw </RadioButton>
            </RadioGroup>

            <BaseValueInput
                v-show="selectedMethod === 'deposit'"
                :input-value.sync="depositAmount"
                :max-value="maxDeposit"
                :min-value="minimumDaiAmount"
                :fallback-value="maxDeposit"
                :disabled="!canDeposit || isAllowanceAmountLoading"
            />
            <div v-if="selectedMethod === 'deposit'">
                <WalletVATCheckPanel
                    :is-correct.sync="isWalletDaiCheckPassed"
                    :wallet-amount="maxDeposit"
                    :desired-amount="depositAmount || maxDeposit"
                    :token-address="tokenAddressDai"
                    :network="network"
                    :is-table-shown="false"
                    :is-loading="isLoading"
                    :is-explanations-shown="isExplanationsShown"
                    :disabled="isLoading || isSubmitting || isAllowanceAmountLoading || isAuthorizationLoading"
                    @refresh="$emit('refresh')"
                />
                <AllowanceAmountCheckPanel
                    :is-correct.sync="isAllowanceAmountCheckPassed"
                    :allowance-amount="allowanceAmount"
                    :desired-amount="depositAmount || maxDeposit"
                    :is-loading="isAllowanceAmountLoading"
                    :is-explanations-shown="isExplanationsShown"
                    :disabled="isLoading || isSubmitting"
                    @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
                />
            </div>

            <BaseValueInput
                v-show="selectedMethod === 'withdraw'"
                :input-value.sync="withdrawAmount"
                :max-value="maxWithdraw"
                :min-value="minimumDaiAmount"
                :fallback-value="maxWithdraw"
                :disabled="!canWithdraw || isAllowanceAmountLoading || isAuthorizationLoading"
            />
            <div v-if="selectedMethod === 'withdraw'">
                <WalletVatDaiWithdrawCheckPanel
                    :is-correct.sync="isWalletVatDaiCheckPassed"
                    :wallet-vat-dai="maxWithdraw"
                    :desired-amount="withdrawAmount || maxWithdraw"
                    :is-loading="isLoading"
                    :is-explanations-shown="isExplanationsShown"
                    :disabled="isLoading || isSubmitting || isAllowanceAmountLoading || isAuthorizationLoading"
                    @refresh="$emit('refresh')"
                />
                <WalletAuthorizationCheckPanel
                    :is-correct.sync="isWalletAuthorizationsCheckPassed"
                    :wallet-address="walletAddress"
                    :is-wallet-authorized="isWalletAuthorized"
                    :is-loading="isAuthorizationLoading"
                    :is-explanations-shown="isExplanationsShown"
                    :disabled="isLoading || isSubmitting || isAllowanceAmountLoading || isAuthorizationLoading"
                    @authorizeWallet="$emit('authorizeWallet')"
                />
            </div>

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
import TextBlock from '~/components/common/other/TextBlock.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BaseValueInput from '~/components/common/inputs/BaseValueInput.vue';
import WalletVATCheckPanel from '~/components/panels/WalletVATCheckPanel.vue';
import AllowanceAmountCheckPanel from '~/components/panels/AllowanceAmountCheckPanel.vue';
import WalletVatDaiWithdrawCheckPanel from '~/components/panels/WalletVatDaiWithdrawCheckPanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';

export default Vue.extend({
    name: 'WalletDepositWithdrawBlock',
    components: {
        BaseValueInput,
        BaseButton,
        TextBlock,
        RadioGroup: Radio.Group,
        RadioButton: Radio.Button,
        WalletVATCheckPanel,
        AllowanceAmountCheckPanel,
        WalletVatDaiWithdrawCheckPanel,
        WalletAuthorizationCheckPanel,
    },
    props: {
        network: {
            type: String,
            default: undefined,
        },
        walletAddress: {
            type: String,
            default: '',
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
        isAllowanceAmountLoading: {
            type: Boolean,
            default: false,
        },
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        isAuthorizationLoading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            minimumDaiAmount: new BigNumber(0),
            selectedMethod: 'deposit',
            depositAmount: undefined,
            withdrawAmount: undefined,
            isWalletDaiCheckPassed: false,
            isAllowanceAmountCheckPassed: false,
            isWalletVatDaiCheckPassed: false,
            isWalletAuthorizationsCheckPassed: false,
        };
    },
    computed: {
        canDeposit(): boolean {
            return (
                !this.isLoading &&
                !this.isSubmitting &&
                this.allowanceAmount !== undefined &&
                BigNumber.isBigNumber(this.maxDeposit) &&
                !this.maxDeposit.isZero()
            );
        },
        canWithdraw(): boolean {
            return (
                !this.isLoading &&
                !this.isSubmitting &&
                BigNumber.isBigNumber(this.maxWithdraw) &&
                !this.maxWithdraw.isZero()
            );
        },
        canSubmit(): boolean {
            if (this.selectedMethod === 'deposit') {
                if (!this.canDeposit) {
                    return false;
                }
                if (!this.isWalletDaiCheckPassed || !this.isAllowanceAmountCheckPassed) {
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
                if (!this.isWalletVatDaiCheckPassed || !this.isWalletAuthorizationsCheckPassed) {
                    return false;
                }
                if (this.withdrawAmount === undefined) {
                    return true;
                }
                return !this.withdrawAmount.isNaN();
            }
            return false;
        },
        networkTitle(): string {
            return this.network;
        },
    },
    methods: {
        handleMethodChange(e) {
            this.selectedMethod = e.target.value;
        },
        submit() {
            if (this.selectedMethod === 'deposit') {
                this.$emit('deposit', this.depositAmount ?? this.maxDeposit);
            }
            if (this.selectedMethod === 'withdraw') {
                this.$emit('withdraw', this.withdrawAmount ?? this.maxWithdraw);
            }
        },
    },
});
</script>

<style scoped>
.WalletDepositWithDrawBlock {
    @apply flex flex-col gap-4;
}

.WalletDepositWithDrawBlock input {
    @apply text-right pr-14;
}
</style>
