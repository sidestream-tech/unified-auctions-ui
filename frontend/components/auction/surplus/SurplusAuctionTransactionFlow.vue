<template>
    <div>
        <TextBlock title="Surplus transaction" />
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
        <SurplusAuctionBidTransactionTable
            class="mt-4 mb-6"
            :auction="auction"
            @inputBidAmount="inputBidAmount = $event"
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
            <WalletMKRBalanceCheckPanel
                :wallet-m-k-r="walletMKR"
                :required-m-k-r="inputBidAmount || auction.nextMinimumBid"
                :network="network"
                :token-address="tokenAddress"
                :disabled="!isWalletConnected || !isActive || isHighestBidder"
                :is-loading="isRefreshingWallet"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isWalletMKRCheckPassed"
                @refresh="$emit('refreshWallet')"
            />
            <AllowanceAmountCheckPanel
                :disabled="!isWalletConnected || !isActive || isHighestBidder"
                :allowance-amount="allowanceMKR"
                :desired-amount="inputBidAmount || auction.nextMinimumBid"
                currency="MKR"
                :is-loading="isSettingAllowance"
                :is-correct.sync="isAllowanceAmountCheckPassed"
                @setAllowanceAmount="$emit('setAllowanceAmount', $event)"
            />
            <HighestBidCheckPanel
                :auction="auction"
                :wallet-address="walletAddress"
                :disabled="!isWalletMKRCheckPassed || !isAllowanceAmountCheckPassed || !isActive"
                :is-loading="auctionActionState === 'bidding'"
                :bid-amount="inputBidAmount || auction.nextMinimumBid"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isHighestBidder"
                @bid="$emit('bid', $event)"
            />
            <CollectAuctionPanel
                :auction="auction"
                :wallet-address="walletAddress"
                :is-collecting="auctionActionState === 'collecting'"
                @collect="$emit('collect')"
            />
            <WithdrawDAIPanel
                :is-explanations-shown="isExplanationsShown"
                :wallet-address="walletAddress"
                :is-authorizing="isAuthorizing"
                :is-wallet-authorized="isWalletAuthorized"
                :is-withdrawing="isWithdrawing"
                :disabled="isRefreshingWallet"
                :dai-vat-balance="daiVatBalance"
                :state="auctionState"
                @manageVat="$emit('manageVat')"
                @authorizeWallet="$emit('authorizeWallet')"
                @withdrawAllDaiFromVat="$emit('withdrawAllDaiFromVat')"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { SurplusAuctionTransaction } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import { SurplusAuctionStates, CompensationAuctionActionStates } from 'auctions-core/src/types';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import WalletMKRBalanceCheckPanel from '~/components/panels/WalletMKRBalanceCheckPanel.vue';
import AllowanceAmountCheckPanel from '~/components/panels/AllowanceAmountCheckPanel.vue';
import HighestBidCheckPanel from '~/components/panels/HighestBidCheckPanel.vue';
import WithdrawDAIPanel from '~/components/panels/WithdrawDAIPanel.vue';
import SurplusAuctionBidTransactionTable from '~/components/auction/surplus/SurplusAuctionBidTransactionTable.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import CollectAuctionPanel from '~/components/panels/CollectAuctionPanel.vue';

export default Vue.extend({
    components: {
        CollectAuctionPanel,
        AllowanceAmountCheckPanel,
        WalletMKRBalanceCheckPanel,
        HighestBidCheckPanel,
        TextBlock,
        Alert,
        SurplusAuctionBidTransactionTable,
        WalletConnectionCheckPanel,
        WithdrawDAIPanel,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuctionTransaction>,
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
        walletMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        allowanceMKR: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isConnectingWallet: {
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
        tokenAddress: {
            type: String,
            default: undefined,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isWalletConnected: false,
            isWalletMKRCheckPassed: false,
            isAllowanceAmountCheckPassed: false,
            isHighestBidder: false,
            inputBidAmount: undefined as BigNumber | undefined,
        };
    },
    computed: {
        isActive(): boolean {
            return this.auction.state !== 'ready-for-collection';
        },
        auctionState(): SurplusAuctionStates {
            return this.auction.state;
        },
    },
});
</script>
