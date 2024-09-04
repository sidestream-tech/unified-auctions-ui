<template>
    <modal
        :visible="isShown"
        title="Manage DAI in VAT"
        :footer="null"
        :dialog-style="{ top: '60px' }"
        :width="620"
        :class="{ dark: isDarkMode }"
        destroy-on-close
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
            <TextBlock v-if="isExplanationsShown" title="What is VAT?">
                The VAT balance is the balance of DAI tokens owned by your wallet inside the Maker Protocol.
                <a
                    target="_blank"
                    href="https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
                    >The VAT itself</a
                >
                is the set of immutable rules for managing DAI and collaterals which constitutes the core of the Maker
                Protocol.
            </TextBlock>
            <WalletDepositWithdrawBlock
                :network="network"
                :is-loading="isLoading"
                :is-submitting="isSubmitting"
                :is-explanations-shown="isExplanationsShown"
                :allowance-amount="allowanceAmount"
                :max-deposit="walletBalances && walletBalances.walletDAI"
                :max-withdraw="walletBalances && walletBalances.walletVatDAI"
                :token-address-dai="tokenAddressDai"
                :wallet-address="walletAddress"
                :is-allowance-amount-loading="isAllowanceAmountLoading"
                :is-wallet-authorized="isWalletAuthorized"
                :is-authorization-loading="isAuthorizationLoading"
                @refresh="$emit('refresh')"
                @deposit="$emit('deposit', $event)"
                @withdraw="$emit('withdraw', $event)"
                @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
                @authorizeWallet="$emit('authorizeWallet')"
            />
        </div>
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal } from 'ant-design-vue';
import { WalletBalances } from 'auctions-core/src/types';
import BigNumber from 'bignumber.js';
import TextBlock from '~/components/common/other/TextBlock.vue';
import WalletTable from '~/components/wallet/WalletTable.vue';
import WalletDepositWithdrawBlock from '~/components/wallet/WalletDepositWithdrawBlock.vue';

export default Vue.extend({
    components: {
        TextBlock,
        WalletDepositWithdrawBlock,
        WalletTable,
        Modal,
    },
    props: {
        network: {
            type: String,
            default: undefined,
        },
        tokenAddressDai: {
            type: String,
            default: undefined,
        },
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
            default: '',
        },
        walletBalances: {
            type: Object as Vue.PropType<WalletBalances>,
            default: null,
        },
        allowanceAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
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
        isAllowanceAmountLoading: {
            type: Boolean,
            default: false,
        },
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        isAuthorizationLoading: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
