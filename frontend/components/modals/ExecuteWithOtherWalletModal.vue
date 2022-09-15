<template>
    <div>
        <modal :visible="isShown" title="Execute to another wallet" destroy-on-close @cancel="cancel">
            <TextBlock class="py-4 px-6 text-sm">
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
                    <Alert type="error">
                        <template slot="message">
                            Address <span class="font-bold">{{ outcomeWalletInputValue }}</span> is not a valid
                            address.
                        </template>
                    </Alert>
                </div>
            </TextBlock>
            <template slot="footer">
                <div class="py-2 px-2">
                    <BaseButton @click="cancel"> Cancel </BaseButton>
                    <BaseButton :disabled="!isOutcomeWalletInputValueValid" @click="execute">
                        Execute transaction
                    </BaseButton>
                </div>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
import { Modal, Input, Alert } from 'ant-design-vue';
import Vue from 'vue';
import { ethers } from 'ethers';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    name: 'ExecuteWithOtherWalletModal',
    components: { TextBlock, BaseButton, Modal, Input, Alert, FormatAddress, Explain },
    props: {
        isShown: {
            type: Boolean,
            default: false,
        },
        defaultWallet: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
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
        cancel(): void {
            this.outcomeWalletInputValue = undefined;
            this.$emit('update:isShown', false);
        },
        execute(): void {
            this.$emit('execute', this.outcomeWalletInputValue);
            this.$emit('update:isShown', false);
        },
    },
});
</script>
