<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Make a bid">
            Auction bidding incurs transaction fee of approximately
            <FormatCurrency :value="transactionAmountDAI" :decimals="5" currency="ETH" />, hence, the connected wallet
            needs to hold enough funds to cover these fees. The transaction fee is a recommended value and based on the
            <Explain text="average fast fee">
                <a href="https://ethereum.org/en/developers/docs/gas/#why-can-gas-fees-get-so-high" target="_blank">
                    Gas Prices can change
                </a>
                due to changing busyness of the Ethereum network. However, you can look up the current average gas
                price
                <a href="https://ethgasstation.info/" target="_blank"> here </a> </Explain
            >. The amount can be edited by the participant to influence the speed of the transaction. <br /><br />
            By default, the profit from a successful bidding will be sent to the same wallet which executed the
            transaction. However, you can provide a different address which will receive the transaction profit.
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <BaseButton v-if="!isLoading" :disabled="disabled" type="primary">
                <span>
                    Bid <format-currency :value="auctionTransaction.totalPrice" currency="DAI" /> for
                    <format-currency
                        :value="auctionTransaction.collateralAmount"
                        :currency="auctionTransaction.collateralSymbol"
                    />
                </span>
            </BaseButton>
            <BaseButton v-else is-loading disabled>Bidding...</BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import Explain from '~/components/utils/Explain.vue';
import { AuctionTransaction } from '~/../core/src/types';

export default Vue.extend({
    components: {
        TextBlock,
        BaseButton,
        FormatCurrency,
        Explain,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            default: null,
        },
        transactionAmountDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
    },
});
</script>
