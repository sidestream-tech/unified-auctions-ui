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
                :wallet-balances="walletBalances"
                @refresh="$emit('refresh')"
                @connectWallet="$emit('connectWallet')"
            />
            <AccessDaiBlock
                :is-loading="isConnecting"
                :is-explanations-shown="isExplanationsShown"
                :is-dai-access-granted="isConnected"
                @grantAccess="$emit('connect')"
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
                :allowance-amount="allowanceAmount"
                :is-withdrawing-allowed="isWithdrawingAllowed"
                :max-deposit="walletBalances ? walletBalances.walletDAI : undefined"
                :max-withdraw="walletBalances ? walletBalances.walletVatDAI : undefined"
                :token-address-d-a-i="tokenAddressDAI"
                @deposit="value => $emit('deposit', value)"
                @withdraw="value => $emit('withdraw', value)"
            />
        </div>
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal } from 'ant-design-vue';
import { WalletBalances } from 'auctions-core/dist/src/types';
import BigNumber from 'bignumber.js';
import TextBlock from '../common/TextBlock.vue';
import AccessDaiBlock from '../transaction/AccessDaiBlock.vue';
import WalletTable from './WalletTable.vue';
import WalletDepositWithdrawBlock from './WalletDepositWithdrawBlock.vue';

export default Vue.extend({
    name: 'ManageVATModal',
    components: { AccessDaiBlock, TextBlock, WalletDepositWithdrawBlock, WalletTable, Modal },
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
        tokenAddressDAI: {
            type: String,
            required: true,
        },
        allowanceAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
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
        isConnecting: {
            type: Boolean,
            default: false,
        },
        isConnected: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
