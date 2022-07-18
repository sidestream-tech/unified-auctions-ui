<template>
    <TextBlock>
        <div v-if="transactionAddress">
            Transaction <format-address shorten :value="transactionAddress" /> was successfully executed.
            <format-address explicit :value="transactionAddress" />
        </div>
        <div v-else-if="isExplanationsShown">
            Auction bidding incurs transaction fee of approximately
            <FormatCurrency :value="transactionFee" :decimals="5" currency="ETH" />, hence, the connected wallet needs
            to hold enough funds to cover these fees. The transaction fee is a recommended value and based on the
            <Explain text="average fast fee">
                <a href="https://ethereum.org/en/developers/docs/gas/#why-can-gas-fees-get-so-high" target="_blank">
                    Gas Prices can change
                </a>
                due to changing busyness of the Ethereum network. However, you can look up the current average gas
                price
                <a href="https://ethgasstation.info/" target="_blank"> here </a> </Explain
            >. The amount can be edited by the participant to influence the speed of the transaction.
            <div v-if="showDifferentWalletInfo" class="mt-2">
                By default, the profit from a successful bidding will be sent to the same wallet which executed the
                transaction. However, you can provide a different address which will receive the transaction profit.
            </div>
        </div>
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    components: {
        TextBlock,
        FormatCurrency,
        FormatAddress,
        Explain,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        transactionAddress: {
            type: String,
            default: null,
        },
        transactionFee: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: null,
        },
        showDifferentWalletInfo: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
