<template>
    <div>
        <div class="flex flex-row-reverse md:mb-0">
            <base-button
                :disabled="disabled"
                class="w-full md:w-80"
                :is-loading="isLoading"
                @click="setModalVisibility(true)"
            >
                Execute to another wallet
            </base-button>
        </div>
        <modal v-model="isVisible" title="Execute to another wallet" destroy-on-close>
            <TextBlock class="py-2 px-6 text-sm">
                Currently, the wallet which will receive the transaction profit is
                <format-address type="address" shorten :value="defaultWallet" />. If you want to use a different
                address for the profit of a successful bid, you can set it below. It can be an address of someone you
                know or a so-called

                <Explain text="cold wallet">
                    Cold wallet is the wallet primarily used to store money, not execute the transactions. More info
                    about the wallet types can be found
                    <a
                        href="https://blog.makerdao.com/a-guide-to-crypto-wallet-types/#:~:text=Making%20Sense%20of%20Crypto%20Wallet%20Types*"
                        target="_blank"
                    >
                        here</a
                    >.</Explain
                >. The transaction fee, however, will always be charged from the wallet that executes the transaction
                and is connected to this UI.

                <label class="block mt-5">
                    <span class="font-bold"> Receiving wallet address: </span>
                    <Input v-model="outcomeWalletInputValue" placeholder="Wallet address" />
                </label>

                <div
                    v-if="!isOutcomeWalletInputValueValid && outcomeWalletInputValue"
                    class="flex flex-col space-y-3 my-3 md:mb-0"
                >
                    <Alert type="error" :message="`Address ${outcomeWalletInputValue} seems to be incorrect`" />
                </div>
            </TextBlock>
            <template slot="footer">
                <BaseButton @click="cancel"> Cancel </BaseButton>
                <BaseButton :disabled="!isOutcomeWalletInputValueValid" @click="execute">
                    Execute transaction
                </BaseButton>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
import { Modal, Input, Alert } from 'ant-design-vue';
import Vue from 'vue';
import { ethers } from 'ethers';
import BaseButton from '~/components/common/BaseButton.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    name: 'ExecuteWithOtherWalletBlock',
    components: { TextBlock, BaseButton, Modal, Input, Alert, FormatAddress, Explain },
    props: {
        defaultWallet: {
            type: String,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isVisible: false,
            outcomeWalletInputValue: undefined as string | undefined,
        };
    },
    computed: {
        isOutcomeWalletInputValueValid(): boolean {
            if (this.outcomeWalletInputValue) {
                try {
                    return !!ethers.utils.getAddress(this.outcomeWalletInputValue);
                } catch {
                    return false;
                }
            }
            return false;
        },
    },
    methods: {
        setModalVisibility(newState: boolean): void {
            this.isVisible = newState;
        },
        cancel(): void {
            this.outcomeWalletInputValue = undefined;
            this.setModalVisibility(false);
        },
        execute(): void {
            this.$emit('execute', this.outcomeWalletInputValue);
            this.setModalVisibility(false);
        },
    },
});
</script>
