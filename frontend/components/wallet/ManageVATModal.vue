<template>
    <modal
        :visible="isShown"
        title="Withdraw or Deposit VAT"
        :footer="null"
        :dialog-style="{ top: '60px' }"
        :width="620"
        :class="isDarkMode && 'dark'"
        @cancel="$emit('cancel')"
    >
        <div class="flex flex-col gap-4 p-4">
            <WalletTable
                :wallet-address="walletAddress"
                :is-explanations-shown="isExplanationsShown"
                :is-loading="isLoading"
                :is-wallet-loading="isWalletLoading"
                :wallet-d-a-i="walletDAI"
                :wallet-e-t-h="walletETH"
                :wallet-last-updated-date="walletLastUpdatedDate"
                :wallet-vat-d-a-i="walletVatDAI"
                @refresh="$emit('refresh')"
                @connectWallet="$emit('connectWallet')"
            />
            <TextBlock v-if="isExplanationsShown" title="What is VAT?">
                The VAT balance is the balance of DAI tokens owned by your wallet inside of the MakerDAO protocol.
                <a
                    target="_blank"
                    href="https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
                    >The VAT itself</a
                >
                is the set of immutable rules for managing DAI and collaterals which constitutes the core of the
                MakerDAO.
            </TextBlock>
            <WalletDepositWithdrawBlock
                :is-loading="isLoading"
                :is-submitting="isSubmitting"
                :is-explanations-shown="isExplanationsShown"
                :is-depositing-allowed="isDepositingAllowed"
                :is-withdrawing-allowed="isWithdrawingAllowed"
                :max-deposit="maxDeposit"
                :max-withdraw="maxWithdraw"
                :token-address-d-a-i="tokenAddressDAI"
                @deposit="value => $emit('deposit', value)"
                @withdraw="value => $emit('withdraw', value)"
            />
        </div>
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Modal } from 'ant-design-vue';
import { WalletBalances } from 'auctions-core/dist/src/types';
import TextBlock from '../common/TextBlock.vue';
import WalletTable from './WalletTable.vue';
import WalletDepositWithdrawBlock from './WalletDepositWithdrawBlock.vue';

export default Vue.extend({
    name: 'ManageVATModal',
    components: { TextBlock, WalletDepositWithdrawBlock, WalletTable, Modal },
    props: {
        isShown: {
            type: Boolean,
            default: false,
        },
        isDarkMode: {
            type: Boolean,
            default: false,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        walletBalances: {
            type: Object as Vue.PropType<WalletBalances>,
            default: null,
        },
        walletETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletVatDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletLastUpdatedDate: {
            type: [String, Number, Date],
            default: null,
        },
        maxDeposit: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        maxWithdraw: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        tokenAddressDAI: {
            type: String,
            required: true,
        },
        isDepositingAllowed: {
            type: Boolean,
            required: true,
        },
        isWithdrawingAllowed: {
            type: Boolean,
            required: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isSubmitting: {
            type: Boolean,
            default: false,
        },
        isWalletLoading: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
});
</script>
