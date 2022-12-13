<template>
    <div>
        <TextBlock title="Swap transaction" />
        <Alert
            v-if="!auctionTransaction.isActive"
            message="This auction is inactive and must be restarted"
            type="error"
        />
        <Alert v-if="auctionTransaction.isFinished" message="This auction is finished" type="error" />
        <CollateralAuctionSwapTransactionTable
            :auction-transaction="auctionTransaction"
            :market-id.sync="currentMarketId"
            :is-autorouting-enabled="isAutoroutingEnabled"
            class="mt-4"
            @update:toggleAutoRouterLoad="$emit('toggleAutoRouterLoad', $event)"
        />
        <TextBlock class="TextBlock mt-4 mb-8">
            Please note, the transaction fee is a suggested value based on the current gas prices on the market; the
            Transaction Net Profit is also approximate, since it is extrapolated from the exchange rates and may change
            during the transaction. If you’re bidding with other participants at the same time, the one who pays a
            higher transaction fee has
            <Explain text="more chances to win">
                For transactions that need to get preferentially executed ahead of other transactions
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#front-running"
                    target="_blank"
                    >in the same block</a
                >, a
                <a
                    href="https://ethereum.org/en/developers/docs/gas/#:~:text=10302608.6%20gwei-,Priority%20fee%20(tips),-Before%20the%20London"
                    target="_blank"
                    >higher tip</a
                >
                will be necessary to attempt to outbid competing transactions
            </Explain>
            the auction. In case your transaction will be rejected, it only results in the loss of the transaction fee.
        </TextBlock>
        <div>
            <WalletConnectionCheckPanel
                :is-correct.sync="isWalletConnectedCheck"
                :wallet-address="walletAddress"
                :is-loading="isConnecting"
                :is-explanations-shown="isExplanationsShown"
                :disabled="!isAuctionActiveAndNotFinished"
                @connectWallet="$emit('connect')"
                @disconnectWallet="$emit('disconnect')"
            />
            <WalletAuthorizationCheckPanel
                :is-correct.sync="isWalletDAIAuthorizationCheckPassed"
                :is-wallet-authorized="isWalletAuthorized"
                :disabled="!isAuctionActiveAndNotFinished || !isWalletConnectedCheck"
                :wallet-address="walletAddress"
                :is-explanations-shown="isExplanationsShown"
                :is-loading="isAuthorizing"
                @authorizeWallet="$emit('authorizeWallet')"
            />
            <CollateralAuthorizationCheckPanel
                :is-correct.sync="isWalletCollateralAuthorizationCheckPassed"
                :collateral-type="auctionTransaction.collateralType"
                :authorized-collaterals="authorisedCollaterals"
                :auth-transaction-fee-e-t-h="auctionTransaction.authTransactionFeeETH"
                :wallet-address="walletAddress"
                :is-loading="isAuthorizing"
                :disabled="!isAuctionActiveAndNotFinished || !isWalletDAIAuthorizationCheckPassed"
                :is-explanations-shown="isExplanationsShown"
                @authorizeCollateral="$emit('authorizeCollateral', auctionTransaction.collateralType)"
            />
            <ProfitCheckPanel
                :is-correct.sync="isProfitCheckPassed"
                :gross-profit="transactionGrossProfit"
                :net-profit="transactionNetProfit"
                :is-explanations-shown="isExplanationsShown"
            />
        </div>
        <CollateralAuctionExecutionBlock
            class="mt-3"
            :disabled="
                !isAuctionActiveAndNotFinished ||
                !isWalletDAIAuthorizationCheckPassed ||
                !isWalletCollateralAuthorizationCheckPassed ||
                !isProfitCheckPassed
            "
            :is-loading="isExecuting"
            :transaction-address="auctionTransaction.transactionAddress"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            :collateral-type="auctionTransaction.collateralType"
            :is-wallet-connected="isWalletConnectedCheck"
            :is-wallet-authed="isWalletAuthorized"
            :is-collateral-authed="isWalletCollateralAuthorizationCheckPassed"
            :fees="fees"
            @execute="
                $emit('execute', {
                    id: auctionTransaction.id,
                    marketId: marketSuggestionOrSelection,
                    alternativeDestinationAddress: $event,
                })
            "
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Alert } from 'ant-design-vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';
import CollateralAuthorizationCheckPanel from '~/components/panels/CollateralAuthorizationCheckPanel.vue';
import ProfitCheckPanel from '~/components/panels/ProfitCheckPanel.vue';
import CollateralAuctionExecutionBlock from '~/components/auction/collateral/CollateralAuctionExecutionBlock.vue';
import CollateralAuctionSwapTransactionTable from '~/components/auction/collateral/CollateralAuctionSwapTransactionTable.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';
import { AuctionTransaction } from '~/../core/src/types';

export default Vue.extend({
    name: 'SwapTransaction',
    components: {
        ProfitCheckPanel,
        CollateralAuthorizationCheckPanel,
        WalletAuthorizationCheckPanel,
        WalletConnectionCheckPanel,
        Explain,
        TextBlock,
        CollateralAuctionSwapTransactionTable,
        CollateralAuctionExecutionBlock,
        Alert,
    },
    props: {
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
            required: true,
        },
        isConnecting: {
            type: Boolean,
            default: false,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isExecuting: {
            type: Boolean,
            default: false,
        },
        isWalletAuthorized: {
            type: Boolean,
            default: false,
        },
        authorisedCollaterals: {
            type: Array as Vue.PropType<string[]>,
            default: () => [],
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isAutoroutingEnabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            currentMarketId: '',
            isWalletConnectedCheck: false,
            isWalletDAIAuthorizationCheckPassed: false,
            isWalletCollateralAuthorizationCheckPassed: false,
            isProfitCheckPassed: false,
        };
    },
    computed: {
        isConnected(): boolean {
            return this.walletAddress !== null;
        },
        isCollateralAuthorized(): boolean {
            return this.authorisedCollaterals.includes(this.auctionTransaction.collateralType);
        },
        isAuctionActiveAndNotFinished(): boolean {
            return this.auctionTransaction.isActive && !this.auctionTransaction.isFinished;
        },
        fees() {
            const fees = { 'Swap Transaction Fee': this.auctionTransaction.swapTransactionFeeETH };
            if (!this.isWalletDAIAuthorizationCheckPassed) {
                fees['Wallet Authorization Fee'] = this.auctionTransaction.authTransactionFeeETH;
            }
            if (!this.isWalletCollateralAuthorizationCheckPassed) {
                fees['Collateral Authorization Fee'] = this.auctionTransaction.authTransactionFeeETH;
            }
            return fees;
        },
        marketSuggestionOrSelection(): string | undefined {
            return this.currentMarketId || this.auctionTransaction.suggestedMarketId;
        },
        transactionGrossProfit(): BigNumber | undefined {
            if (!this.auctionTransaction.marketDataRecords) {
                return undefined;
            }
            return this.auctionTransaction.marketDataRecords[this.marketSuggestionOrSelection]?.transactionGrossProfit;
        },
        transactionNetProfit(): BigNumber | undefined {
            if (!this.auctionTransaction.marketDataRecords) {
                return undefined;
            }
            return this.auctionTransaction.marketDataRecords[this.marketSuggestionOrSelection]?.transactionNetProfit;
        },
    },
});
</script>
