<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            After the auction is collected, DAI will end up in the highest bidder's VAT account. One more transaction
            is required to move DAI from VAT to the wallet.
        </TextBlock>
        <div class="mb-4">
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
            <BaseButton :disabled="isWithdrawing" :is-loading="isFetching" @click="$emit('fetchDaiVatBalance')">
                Refresh DAI balance in VAT
            </BaseButton>
            <BaseButton
                type="primary"
                :disabled="!isWalletConnected || !isWalletAuthorized || !hasDaiToWithdraw || isFetching"
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
import BaseButton from '~/components/common/BaseButton.vue';
import BasePanel from '~/components/common/BasePanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

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
            default: '',
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
        isFetching: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
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
