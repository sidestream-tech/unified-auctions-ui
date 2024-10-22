<template>
    <div>
        <TransactionMessage
            :is-explanations-shown="isExplanationsShown"
            :transaction-address="auctionTransaction.transactionAddress"
            :is-wallet-connected="isWalletConnected"
            :is-wallet-authed="isWalletAuthed"
            :is-collateral-authed="isCollateralAuthed"
            :fees="fees"
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
                        :currency="auctionTransaction.tokenName"
                    />
                </span>
            </BaseButton>
            <BaseButton v-else is-loading disabled class="w-full md:w-80">Bidding...</BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import TransactionMessage from '~/components/auction/TransactionMessage.vue';
import { AuctionTransaction } from '~/../core/src/types';

export default Vue.extend({
    name: 'BidBlock',
    components: {
        BaseButton,
        FormatCurrency,
        TransactionMessage,
    },
    props: {
        fees: {
            type: Object,
            default: undefined,
        },
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
        isWalletConnected: {
            type: Boolean,
            default: false,
        },
        isWalletAuthed: {
            type: Boolean,
            default: false,
        },
        isCollateralAuthed: {
            type: Boolean,
            default: false,
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
