<template>
    <div>
        <TextBlock title="Vault Liquidation transaction" />
        <Alert v-if="wasLiquidated" show-icon type="warning">
            <div slot="message">
                <p>This vault has been liquidated into a collateral auction</p>
                <div class="flex justify-end mt-2">
                    <nuxt-link :to="auctionLink">
                        <Button> View collateral auction {{ vaultTransaction.auctionId }} </Button>
                    </nuxt-link>
                </div>
            </div>
        </Alert>
        <VaultLiquidationTransactionTable v-if="!wasLiquidated" class="my-4" :vault-transaction="vaultTransaction" />
        <TextBlock class="mt-4">
            <template v-if="wasLiquidated">
                This vault was liquidated <TimeTill :date="vaultTransaction.liqudiationDate" /> in the transaction
                <FormatAddress :value="vaultTransaction.transactionHash" />.
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
        <div v-if="!wasLiquidated" class="mb-4">
            <WalletConnectionCheckPanel
                :wallet-address="walletAddress"
                :is-loading="isConnectingWallet"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isWalletConnected"
                @connectWallet="$emit('connectWallet')"
                @disconnectWallet="$emit('disconnectWallet')"
            />
            <VaultLiquidationLimitsCheckPanel
                :liquidation-limits="liquidationLimits"
                :collateral-type="vaultTransaction.collateralType"
                :debt-dai="vaultTransaction.debtDai"
                :incentive-relative-dai="vaultTransaction.incentiveRelativeDai"
                :incentive-constant-dai="vaultTransaction.incentiveConstantDai"
                :is-refreshing="isRefreshingLimits"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="areLimitsNotReached"
                @refreshLimits="$emit('refreshLimits')"
            />
            <VaultLiquidationPanel
                :vault-id="vaultTransaction.id"
                :network="vaultTransaction.network"
                :vault-state="vaultTransaction.state"
                :wallet-address="walletAddress"
                :disabled="!isWalletConnected || !areLimitsNotReached"
                :is-liquidating="isLiquidating"
                :is-explanations-shown="isExplanationsShown"
                @liquidate="$emit('liquidate', $event)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Alert, Button } from 'ant-design-vue';
import { LiquidationLimits, VaultTransactionNotLiquidated } from 'auctions-core/dist/src/types';
import TransactionFeesTable from '../auction/TransactionFeesTable.vue';
import { generateLink } from '../../helpers/generateLink';
import TimeTill from '../common/formatters/TimeTill.vue';
import FormatAddress from '../common/formatters/FormatAddress.vue';
import VaultLiquidationLimitsCheckPanel from '../panels/VaultLiquidationLimitsCheckPanel.vue';
import VaultLiquidationPanel from '../panels/VaultLiquidationPanel.vue';
import VaultLiquidationTransactionTable from './VaultLiquidationTransactionTable.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
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
        Explain,
    },
    props: {
        vaultTransaction: {
            type: Object as Vue.PropType<VaultTransactionNotLiquidated>,
            required: true,
        },
        liquidationLimits: {
            type: Object as Vue.PropType<LiquidationLimits>,
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
            areLimitsNotReached: false,
        };
    },
    computed: {
        auctionLink(): string | undefined {
            if (!this.vaultTransaction || !this.vaultTransaction.auctionId) {
                return undefined;
            }
            const link = generateLink(this.vaultTransaction.network, 'collateral');
            return `${link}&auction=${encodeURIComponent(this.vaultTransaction.auctionId)}`;
        },
        wasLiquidated(): boolean {
            return this.vaultTransaction.state === 'liquidated';
        },
    },
});
</script>
