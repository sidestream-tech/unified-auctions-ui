<template>
    <div>
        <TextBlock title="Vault Liquidation transaction" />
        <Alert v-if="wasLiquidated" show-icon type="info">
            <div slot="message">
                <p>This vault has been liquidated into a collateral auction</p>
                <div class="flex justify-end mt-2">
                    <nuxt-link :to="auctionLink">
                        <Button type="primary">
                            View collateral auction {{ vaultTransaction.pastLiquidations[0].auctionId }}
                        </Button>
                    </nuxt-link>
                </div>
            </div>
        </Alert>
        <VaultLiquidationTransactionTable v-if="!wasLiquidated" class="my-4" :vault-transaction="vaultTransaction" />
        <TextBlock class="mt-4">
            <template v-if="wasLiquidated">
                This vault was last liquidated
                <TimeTill :date="vaultTransaction.pastLiquidations[0].liquidationDate" /> in the transaction
                <FormatAddress :value="vaultTransaction.pastLiquidations[0].transactionHash" />.
                <div v-if="walletAddress" class="mt-4">
                    <WithdrawDAIPanel
                        :wallet-address="walletAddress"
                        :dai-vat-balance="daiVatBalance"
                        :is-authorizing="isAuthorizing"
                        :is-wallet-authorized="isWalletAuthorized"
                        :is-withdrawing="isWithdrawing"
                        :is-explanations-shown="isExplanationsShown"
                        :state="vaultTransaction.state"
                        @manageVat="$emit('manageVat')"
                        @authorizeWallet="$emit('authorizeWallet')"
                        @withdrawAllDaiFromVat="$emit('withdrawAllDaiFromVat')"
                    />
                </div>
            </template>
            <template v-else>
                Please note, the
                <Explain text="transaction fee" width="350px">
                    <TransactionFeesTable
                        :fees="{ LiquidationFee: vaultTransaction.transactionFeeLiquidationEth }"
                        :combined-fees-eth="vaultTransaction.transactionFeeLiquidationEth"
                    />
                </Explain>
                is a suggested value based on the current gas prices on the market; the “potential net profit” is also
                approximate, since it is extrapolated from the exchange rates and may change during the transaction. If
                you’re executing transactions with other participants at the same time, the one who pays a higher
                transaction fee has more chances to receive the incentive. In case your transaction will be rejected,
                it will only result in the loss of the transaction fee.
            </template>
        </TextBlock>
        <div v-if="!wasLiquidated" class="my-4">
            <WalletConnectionCheckPanel
                :wallet-address="walletAddress"
                :is-loading="isConnectingWallet"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isWalletConnected"
                @connectWallet="$emit('connectWallet')"
                @disconnectWallet="$emit('disconnectWallet')"
            />
            <VaultLiquidationLimitsCheckPanel
                :vault-transaction="vaultTransaction"
                :is-refreshing="isRefreshingLimits"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isAnyLiquidationPossible"
                @refreshLimits="$emit('refreshLimits')"
            />
            <VaultLiquidationPanel
                :vault-address="vaultTransaction.address"
                :network="vaultTransaction.network"
                :vault-state="vaultTransaction.state"
                :wallet-address="walletAddress"
                :disabled="!isWalletConnected || !isAnyLiquidationPossible"
                :is-liquidating="isLiquidating"
                :is-explanations-shown="isExplanationsShown"
                @liquidate="$emit('liquidate', $event)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Alert, Button } from 'ant-design-vue';
import { LiquidationLimits, VaultTransaction } from 'auctions-core/dist/src/types';
import TransactionFeesTable from '../auction/TransactionFeesTable.vue';
import { generateLink } from '../../helpers/generateLink';
import TimeTill from '../common/formatters/TimeTill.vue';
import FormatAddress from '../common/formatters/FormatAddress.vue';
import VaultLiquidationLimitsCheckPanel from '../panels/VaultLiquidationLimitsCheckPanel.vue';
import VaultLiquidationPanel from '../panels/VaultLiquidationPanel.vue';
import VaultLiquidationTransactionTable from './VaultLiquidationTransactionTable.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import WithdrawDAIPanel from '~/components/panels/WithdrawDAIPanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        VaultLiquidationPanel,
        VaultLiquidationLimitsCheckPanel,
        FormatAddress,
        TimeTill,
        TransactionFeesTable,
        VaultLiquidationTransactionTable,
        TextBlock,
        Alert,
        Button,
        WalletConnectionCheckPanel,
        WithdrawDAIPanel,
        Explain,
    },
    props: {
        vaultTransaction: {
            type: Object as Vue.PropType<VaultTransaction>,
            required: true,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isConnectingWallet: {
            type: Boolean,
            default: false,
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
        isRefreshingLimits: {
            type: Boolean,
            default: false,
        },
        isLiquidating: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isWalletConnected: false,
            isAnyLiquidationPossible: false,
        };
    },
    computed: {
        auctionLink(): string | undefined {
            if (
                !this.vaultTransaction ||
                this.vaultTransaction.state !== 'liquidated' ||
                !this.vaultTransaction.pastLiquidations
            ) {
                return undefined;
            }
            const link = generateLink(this.vaultTransaction.network, 'collateral');
            return `${link}&auction=${encodeURIComponent(this.vaultTransaction.pastLiquidations[0].auctionId)}`;
        },
        wasLiquidated(): boolean {
            return this.vaultTransaction.state === 'liquidated';
        },
        liquidationLimits(): LiquidationLimits {
            return {
                maximumProtocolDebtDai: this.vaultTransaction.maximumProtocolDebtDai,
                currentProtocolDebtDai: this.vaultTransaction.currentProtocolDebtDai,
                currentCollateralDebtDai: this.vaultTransaction.currentCollateralDebtDai,
                maximumCollateralDebtDai: this.vaultTransaction.maximumCollateralDebtDai,
                liquidationPenaltyRatio: this.vaultTransaction.liquidationPenaltyRatio,
                minimalAuctionedDai: this.vaultTransaction.minimalAuctionedDai,
            };
        },
    },
});
</script>
