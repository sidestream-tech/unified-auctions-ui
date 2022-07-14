<template>
    <div>
        <TransactionMessage
            :is-explanations-shown="isExplanationsShown"
            :transaction-address="transactionAddress"
            :is-wallet-authorized="isWalletAuthorized"
            :is-collateral-authorized="isCollateralAuthorized"
            :auction-transaction="auctionTransaction"
            show-different-wallet-info
        />
        <div class="flex flex-col md:flex-row md:space-x-4 justify-end flex-wrap mt-4">
            <ExecuteWithOtherWalletBlock
                :disabled="disabled || isLoading || state === 'executed'"
                :default-wallet="walletAddress"
                :is-loading="state === 'loading'"
                class="pb-3"
                @execute="executeWithOtherWallet"
            />
            <div>
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
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseButton from '~/components/common/BaseButton.vue';
import ExecuteWithOtherWalletBlock from '~/components/transaction/ExecuteWithOtherWalletBlock.vue';
import TransactionMessage from '~/components/transaction/TransactionMessage.vue';
import { AuctionTransaction } from '~/../core/src/types';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        ExecuteWithOtherWalletBlock,
        BaseButton,
        TransactionMessage,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
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
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        isCollateralAuthorized: {
            type: Boolean,
            default: false,
        },
        collateralType: {
            type: String,
            required: true,
        },
        walletAddress: {
            type: String,
            default: null,
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
    },
    methods: {
        executeWithOtherWallet(wallet: string | undefined) {
            this.$emit('execute', wallet);
        },
    },
});
</script>
