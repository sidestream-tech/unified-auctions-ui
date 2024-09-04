<template>
    <BasePanel :current-state="currentStateAndTitle.name" class="WalletDaiDepositCheckPanel">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <div v-if="isExplanationsShown">
            <TextBlock v-if="currency === 'DAI'">
                To bid on an auction with DAI, first funds need to be deposited to the
                <Explain text="VAT">
                    The
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation#2-contract-details"
                        >VAT contract</a
                    >
                    is the core vault engine of the Maker Protocol and manages the central accounting invariants of
                    DAI. Depositing and interacting with the VAT is necessary in order to participate in auctions. </Explain
                >. The following transaction authorizes the wallet address to deposit into the VAT. It is a
                prerequisite to participate in the auction.
            </TextBlock>
            <TextBlock v-if="currency === 'MKR'">
                In order to move funds the Flap contract address needs to be authorized. Hence the following
                transaction authorizes Flap to withdraw MKR from the wallet.
            </TextBlock>
        </div>
        <div class="my-2 flex justify-between">
            <div>Current allowance</div>
            <div>
                <span v-if="isUnlimitedAllowance">Unlimited {{ currency }}</span>
                <FormatCurrency v-else :value="allowanceAmount" :currency="currency" />
            </div>
        </div>
        <div class="flex justify-end mt-2 gap-5">
            <BaseButton
                class="w-full md:w-80"
                :disabled="isDisabled || isInvalidDesiredAmount"
                :is-loading="isLoading"
                @click="$emit('setAllowanceAmount', alwaysValidDesiredAmount)"
            >
                <span>Allow access to&nbsp;</span>
                <FormatCurrency :value="alwaysValidDesiredAmount" :currency="currency" />
            </BaseButton>
            <BaseButton
                class="w-full md:w-80"
                :type="!isEnough ? 'primary' : ''"
                :disabled="isDisabled || isUnlimitedAllowance"
                :is-loading="isLoading"
                @click="$emit('setAllowanceAmount')"
            >
                Allow unlimited access to {{ currency }}
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        Explain,
        FormatCurrency,
    },
    props: {
        allowanceAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        desiredAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        currency: {
            type: String,
            default: 'DAI',
        },
    },
    computed: {
        isEnough(): boolean {
            if (!this.desiredAmount || !this.allowanceAmount) {
                return false;
            }
            return !this.desiredAmount.isGreaterThan(this.allowanceAmount);
        },
        isUnlimitedAllowance(): boolean {
            return this.allowanceAmount?.toFixed(0).length > 50 ?? false;
        },
        isInvalidDesiredAmount(): boolean {
            return !this.desiredAmount || this.desiredAmount.isNaN() || this.desiredAmount.isLessThanOrEqualTo(0);
        },
        alwaysValidDesiredAmount(): BigNumber {
            if (this.isInvalidDesiredAmount) {
                return new BigNumber(0);
            }
            return this.desiredAmount;
        },
        currentStateAndTitle(): PanelProps {
            if (!this.allowanceAmount) {
                return {
                    name: 'inactive',
                    title: 'Please connect a wallet to check the allowance',
                };
            }
            if (!this.desiredAmount || this.desiredAmount?.isNaN()) {
                return {
                    name: 'inactive',
                    title: 'Please enter the desired value first',
                };
            }
            if (!this.isEnough) {
                return {
                    name: this.disabled ? 'inactive' : 'incorrect',
                    title: `The desired amount exceeds ${this.currency} allowance`,
                };
            }
            return {
                name: 'correct',
                title: `The desired amount is within ${this.currency} allowance`,
            };
        },
        isDisabled(): boolean {
            return this.disabled || !this.allowanceAmount || this.isInvalidDesiredAmount;
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
