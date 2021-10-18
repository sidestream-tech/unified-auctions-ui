<template>
    <div>
        <TextBlock :title="isExplanationsShown ? 'Make a bid' : ''">
            <div v-if="state === 'executed'">
                Transaction <format-address shorten :value="transactionAddress" /> was successfully executed.
                <format-address explicit :value="transactionAddress" />
            </div>
            <div v-else-if="isExplanationsShown">
                Auction participation incurs transaction fees (<FormatCurrency
                    :value="transactionFee"
                    :decimals="6"
                    currency="ETH"
                />), hence, the connected wallet needs to hold enough funds to cover these fees. The transaction fee is
                a recommended value and based on the
                <Explain text="average price">
                    <a
                        href="https://ethereum.org/en/developers/docs/gas/#why-can-gas-fees-get-so-high"
                        target="_blank"
                    >
                        Gas Prices can change
                    </a>
                    due to changing busyness of the Ethereum network. However, you can look up the current average gas
                    price
                    <a href="https://ethgasstation.info/" target="_blank"> here </a> </Explain
                >. The amount can be edited by the participant to influence the speed of the transaction.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse my-3 md:mb-0">
            <base-button
                v-if="state === 'notExecuted'"
                type="primary"
                class="w-full md:w-80"
                @click="$emit('execute')"
            >
                Execute
            </base-button>
            <base-button v-else-if="state === 'loading'" type="primary" class="w-full md:w-80" is-loading>
                Executing...
            </base-button>
            <base-button v-else type="primary" class="w-full md:w-80" disabled> Execute </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        Explain,
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
