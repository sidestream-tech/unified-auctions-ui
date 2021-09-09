<template>
    <div>
        <TextBlock :title="isExplanationsShown ? 'Make a bid' : ''">
            <div v-if="state === 'executed'" class="text-gray-800">
                Transaction <format-address :value="transactionAddress" /> was successfully executed.
                <a :href="transactionURL" target="_blank" class="text-green-500">View on Etherscan</a>.
            </div>
            <div v-else-if="isExplanationsShown" class="text-gray-800">
                Auction participation incurs transaction fees (<FormatCurrency
                    :value="transactionFee"
                    :decimals="6"
                    currency="ETH"
                />). Hence, the connected wallet needs to hold enough funds to cover these fees. The transaction fee is
                a recommended value and based on the
                <a target="_blank" href="https://ethgasstation.info/">average transaction fee</a>. The amount can be
                edited by the participant to influence the speed of the transaction.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button v-if="state === 'notExecuted'" type="primary" class="w-60" @click="$emit('execute')">
                Execute
            </base-button>
            <base-button v-if="state === 'disabled'" type="primary" class="w-60" disabled> Execute </base-button>
            <base-button v-if="state === 'loading'" type="primary" class="w-60" is-loading> Executing... </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        FormatAddress,
        TextBlock,
        BaseButton,
        FormatCurrency,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        transactionAddress: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        transactionFee: {
            type: Number,
            default: null,
        },
        collateralType: {
            type: String,
            required: true,
        },
    },
    computed: {
        state(): string {
            if (this.isLoading) {
                return 'loading';
            }
            if (this.disabled) {
                return 'disabled';
            }
            if (!this.transactionAddress) {
                return 'notExecuted';
            }
            return 'executed';
        },
        transactionURL(): string {
            return `https://kovan.etherscan.io/address/${this.transactionAddress}`;
        },
    },
});
</script>
