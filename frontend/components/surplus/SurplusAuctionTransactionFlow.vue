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
            v-if="auction.state !== 'collected'"
            class="mt-4 mb-6"
            :auction="auction"
            @inputBidAmount="inputBidAmount = $event"
        />
        <div v-if="auction.state !== 'collected'" class="mb-4">
            <WalletConnectionCheckPanel
                :wallet-address="walletAddress"
                :disabled="auction.state === 'requires-restart' || auction.state === 'collected'"
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
            <CollectSurplusAuctionPanel
                :auction="auction"
                :wallet-address="walletAddress"
                :is-collecting="auctionActionState === 'collecting'"
                @collect="$emit('collect')"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { SurplusAuction } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import { SurplusAuctionActionStates } from 'auctions-core/src/types';
import HighestBidCheckPanel from '../panels/HighestBidCheckPanel.vue';
import WalletMKRBalanceCheckPanel from '../panels/WalletMKRBalanceCheckPanel.vue';
import AllowanceAmountCheckPanel from '../panels/AllowanceAmountCheckPanel.vue';
import CollectSurplusAuctionPanel from '../panels/CollectSurplusAuctionPanel.vue';
import SurplusAuctionBidTransactionTable from '~/components/surplus/SurplusAuctionBidTransactionTable.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';

export default Vue.extend({
    components: {
        CollectSurplusAuctionPanel,
        AllowanceAmountCheckPanel,
        WalletMKRBalanceCheckPanel,
        HighestBidCheckPanel,
        TextBlock,
        Alert,
        SurplusAuctionBidTransactionTable,
        WalletConnectionCheckPanel,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuction>,
            required: true,
        },
        auctionActionState: {
            type: String as Vue.PropType<SurplusAuctionActionStates>,
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
    },
});
</script>
