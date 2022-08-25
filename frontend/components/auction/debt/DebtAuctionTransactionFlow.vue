<template>
    <div>
        <TextBlock title="Debt transaction" />
        <Alert
            v-if="auction.state === 'requires-restart'"
            message="This auction is inactive and must be restarted"
            type="error"
        />
        <Alert
            v-if="auction.state === 'ready-for-collection'"
            message="This auction has finished and is ready for collection"
            type="info"
        />
        <Alert
            v-if="auction.state === 'collected'"
            message="This auction is finished and has been collected"
            type="error"
        />
        <DebtAuctionBidTransactionTable
            class="mt-4 mb-6"
            :auction="auction"
            @desiredMkrAmount="desiredMkrAmount = $event"
        />
        <div class="mb-4">
            <WalletConnectionCheckPanel
                :wallet-address="walletAddress"
                :is-loading="isConnectingWallet"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isWalletConnected"
                @connectWallet="$emit('connectWallet')"
                @disconnectWallet="$emit('disconnectWallet')"
            />
            <WalletDepositFlowCheckPanel
                :wallet-amount="walletDai"
                :wallet-vat-amount="walletVatDai"
                :desired-amount="auction.bidAmountDai"
                :allowance-amount="allowanceDai"
                :network="network"
                :token-address="tokenAddress"
                :is-correct.sync="isWalletDAICheckPassed"
                :is-explanations-shown="isExplanationsShown"
                :is-loading="isRefreshingWallet || isSettingAllowance || isDepositing"
                currency="DAI"
                :disabled="isHighestBidder"
                @refresh="$emit('refreshWallet')"
                @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
                @deposit="$emit('deposit', $event)"
            />
            <DebtAuctionAuthorizationCheckPanel
                :disabled="!isWalletConnected"
                :wallet-address="walletAddress"
                :is-debt-auction-authorized="isDebtAuctionAuthorized"
                :is-explanations-shown="isExplanationsShown"
                :is-loading="isAuthorizing"
                @authorizeFlopper="$emit('authorizeFlopper')"
            />
            <DebtLatestBidCheckPanel
                :auction="auction"
                :wallet-address="walletAddress"
                :disabled="!isWalletDAICheckPassed || !isActive || !isDebtAuctionAuthorized"
                :is-loading="auctionActionState === 'bidding'"
                :desired-mkr-amount="desiredMkrAmount || auction.nextMaximumLotReceived"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isHighestBidder"
                @bid="$emit('bid', $event)"
            />
            <CollectAuctionPanel
                :auction="auction"
                :wallet-address="walletAddress"
                :is-collecting="auctionActionState === 'collecting'"
                currency="MKR"
                @collect="$emit('collect')"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { DebtAuction, CompensationAuctionActionStates } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import WalletDepositFlowCheckPanel from '../../panels/WalletDepositFlowCheckPanel.vue';
import DebtLatestBidCheckPanel from '~/components/panels/DebtLatestBidCheckPanel.vue';
import DebtAuctionBidTransactionTable from '~/components/auction/debt/DebtAuctionBidTransactionTable.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import DebtAuctionAuthorizationCheckPanel from '~/components/panels/DebtAuctionAuthorizationCheckPanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import CollectAuctionPanel from '~/components/panels/CollectAuctionPanel.vue';

export default Vue.extend({
    components: {
        WalletDepositFlowCheckPanel,
        CollectAuctionPanel,
        DebtLatestBidCheckPanel,
        DebtAuctionBidTransactionTable,
        TextBlock,
        Alert,
        WalletConnectionCheckPanel,
        DebtAuctionAuthorizationCheckPanel,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<DebtAuction>,
            required: true,
        },
        auctionActionState: {
            type: String as Vue.PropType<CompensationAuctionActionStates>,
            default: null,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        walletDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        walletVatDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        allowanceDai: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        tokenAddress: {
            type: String,
            default: undefined,
        },
        isConnectingWallet: {
            type: Boolean,
            default: false,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isRefreshingWallet: {
            type: Boolean,
            default: false,
        },
        isSettingAllowance: {
            type: Boolean,
            default: false,
        },
        isDepositing: {
            type: Boolean,
            default: false,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isDebtAuctionAuthorized: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isWalletConnected: false,
            isWalletDAICheckPassed: false,
            isHighestBidder: false,
            desiredMkrAmount: undefined as BigNumber | undefined,
        };
    },
    computed: {
        isActive(): boolean {
            return this.auction.state !== 'ready-for-collection';
        },
    },
});
</script>
