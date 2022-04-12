<template>
    <div>
        <TransactionMessage
            :is-explanations-shown="isExplanationsShown"
            :transaction-address="auctionTransaction.transactionAddress"
            :transaction-fee="auctionTransaction.biddingTransactionFeeETH"
        />
        <div class="flex flex-row-reverse mt-3">
            <BaseButton
                v-if="state !== 'loading'"
                class="w-full md:w-80"
                :disabled="state === 'disabled' || state === 'executed'"
                type="primary"
                @click="$emit('bidWithDai')"
            >
                <span>
                    Bid <format-currency :value="transactionBidAmount" currency="DAI" /> for
                    <format-currency
                        :value="amountToReceive || auctionTransaction.collateralAmount"
                        :currency="auctionTransaction.collateralSymbol"
                    />
                </span>
            </BaseButton>
            <BaseButton v-else is-loading disabled class="w-full md:w-80">Bidding...</BaseButton>
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
        transactionBidAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        amountToReceive: {
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
            if (!this.auctionTransaction.transactionAddress) {
                return 'notExecuted';
            }
            return 'executed';
        },
    },
});
</script>
