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
            <HighestDebtBidCheckPanel
                :auction="auction"
                :wallet-address="walletAddress"
                :disabled="!isWalletMKRCheckPassed || !isAllowanceAmountCheckPassed || !isActive"
                :is-loading="auctionActionState === 'bidding'"
                :bid-amount="inputBidAmount || auction.nextMaximumLotReceived"
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
import type { DebtAuction, SurplusAuctionStates, CompensationAuctionActionStates } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import HighestDebtBidCheckPanel from '../../panels/HighestDebtBidCheckPanel.vue';
import DebtAuctionBidTransactionTable from './DebtAuctionBidTransactionTable.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import CollectAuctionPanel from '~/components/panels/CollectAuctionPanel.vue';

export default Vue.extend({
    components: {
        CollectAuctionPanel,
        HighestDebtBidCheckPanel,
        DebtAuctionBidTransactionTable,
        TextBlock,
        Alert,
        WalletConnectionCheckPanel,
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
        isRefreshingWallet: {
            type: Boolean,
            default: false,
        },
        isSettingAllowance: {
            type: Boolean,
            default: false,
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
