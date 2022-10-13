<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            The received profit ended up in the VAT account, not yet in your wallet. One more transaction is required
            to move that DAI to your wallet.
        </TextBlock>
        <div class="my-4">
            <WalletAuthorizationCheckPanel
                :disabled="!isWalletConnected"
                :wallet-address="walletAddress"
                :is-wallet-authorized="isWalletAuthorized"
                :is-explanations-shown="isExplanationsShown"
                :is-loading="isAuthorizing"
                @authorizeWallet="$emit('authorizeWallet')"
            />
        </div>
        <div class="flex justify-end mt-2 gap-5">
            <BaseButton :disabled="isWithdrawing" @click="$emit('manageVat')"> Manage DAI in VAT </BaseButton>
            <BaseButton
                type="primary"
                :disabled="!isWalletConnected || !isWalletAuthorized || !hasDaiToWithdraw || disabled"
                :is-loading="isWithdrawing"
                @click="$emit('withdrawAllDaiFromVat')"
            >
                <span v-if="hasDaiToWithdraw">
                    Withdraw <FormatCurrency :value="daiVatBalance" currency="DAI" /> from VAT
                </span>
                <span v-else> Nothing to withdraw yet </span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { SurplusAuctionStates, VaultTransactionState } from 'auctions-core/src/types';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';

type surplusOrVaultState = SurplusAuctionStates | VaultTransactionState;

export default Vue.extend({
    name: 'WithdrawDAIPanel',
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        FormatCurrency,
        WalletAuthorizationCheckPanel,
    },
    props: {
        walletAddress: {
            type: String,
            default: undefined,
        },
        daiVatBalance: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        isWithdrawing: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        state: {
            type: String as Vue.PropType<surplusOrVaultState>,
            required: true,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (!this.hasDaiToWithdraw) {
                return {
                    name: 'inactive',
                    title: `No DAI to withdraw yet`,
                };
            }
            if (this.hasDaiToWithdraw && this.state !== 'collected' && this.state !== 'liquidated') {
                return {
                    name: 'correct',
                    title: `There is DAI to collect from VAT`,
                };
            }
            return {
                name: 'notice',
                title: `Withdraw DAI from VAT`,
            };
        },
        isWalletConnected(): boolean {
            return !!this.walletAddress;
        },
        hasDaiToWithdraw(): boolean {
            return this.daiVatBalance?.isGreaterThan(0) ?? false;
        },
    },
});
</script>
