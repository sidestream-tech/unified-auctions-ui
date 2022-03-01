<template>
    <div>
        <TransactionMessage
            :is-explanations-shown="isExplanationsShown"
            :is-finished="state === 'executed'"
            :transaction-address="auctionTransaction.transactionAddress"
            :transaction-fee="auctionTransaction.transactionFee"
        />
        <div class="flex flex-row-reverse mt-3">
            <BaseButton
                v-if="state !== 'loading'"
                :disabled="state === 'disabled' || state === 'executed'"
                type="primary"
            >
                <span>
                    Bid <format-currency :value="transactionAmountDAI" currency="DAI" /> for
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
import BaseButton from '~/components/common/BaseButton.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import TransactionMessage from '~/components/transaction/TransactionMessage.vue';
import { AuctionTransaction } from '~/../core/src/types';

export default Vue.extend({
    components: {
        BaseButton,
        FormatCurrency,
        TransactionMessage,
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
    computed: {
        state(): string {
            if (this.isLoading) {
                return 'loading';
            }
            if (this.disabled) {
                return 'disabled';
            }
            if (this.auctionTransaction.transactionProfit?.isLessThan(0)) {
                return 'notProfitable';
            }
            if (!this.auctionTransaction.transactionAddress) {
                return 'notExecuted';
            }
            return 'executed';
        },
    },
});
</script>
