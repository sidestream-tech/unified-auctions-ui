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
            :lowest-next-bid="lowestNextBid"
            @inputBidAmount="inputBidAmount = $event"
        />
        <div v-if="auction.state !== 'collected'" class="mb-4">
            <WalletConnectionCheckPanel
                :wallet-address="walletAddress"
                :disabled="
                    auction.state === 'requires-restart' ||
                    auction.state === 'ready-for-collection' ||
                    auction.state === 'collected'
                "
                :is-loading="isConnecting"
                :is-explanations-shown="isExplanationsShown"
                :is-correct.sync="isWalletConnected"
                @connectWallet="$emit('connect')"
                @disconnectWallet="$emit('disconnect')"
            />
            <WalletAuthorizationCheckPanel
                :is-wallet-authorized="isWalletConnected"
                :wallet-address="walletAddress"
                :is-loading="isAuthorizing"
                :is-explanations-shown="isExplanationsShown"
                @authorizeWallet="$emit('authorizeCollateral', 'DAI')"
            />
            <CollateralAuthorizationCheckPanel
                collateral-type="MKR"
                :authorized-collaterals="isAuthorizedMKR ? ['MKR'] : []"
                :auth-transaction-fee-e-t-h="auction.authTransactionFeeMKR"
                :wallet-address="walletAddress"
                :disabled="!isAuthorizedDAI"
                :is-loading="isAuthorizing"
                :is-explanations-shown="isExplanationsShown"
                @authorizeCollateral="$emit('authorizeCollateral', 'MKR')"
            />
            <HighestBidCheckPanel
                :auction="auction"
                :wallet-address="walletAddress"
                :bid-amount="inputBidAmount || lowestNextBid"
                :is-explanations-shown="isExplanationsShown"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { SurplusAuction } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import HighestBidCheckPanel from '../panels/HighestBidCheckPanel.vue';
import SurplusAuctionBidTransactionTable from '~/components/surplus/SurplusAuctionBidTransactionTable.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';
import CollateralAuthorizationCheckPanel from '~/components/panels/CollateralAuthorizationCheckPanel.vue';
import WalletAuthorizationCheckPanel from '~/components/panels/WalletAuthorizationCheckPanel.vue';

export default Vue.extend({
    components: {
        HighestBidCheckPanel,
        TextBlock,
        Alert,
        SurplusAuctionBidTransactionTable,
        WalletConnectionCheckPanel,
        CollateralAuthorizationCheckPanel,
        WalletAuthorizationCheckPanel,
    },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuction>,
            required: true,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isAuthorizedDAI: {
            type: Boolean,
            default: false,
        },
        isAuthorizedMKR: {
            type: Boolean,
            default: false,
        },
        isAuthorizing: {
            type: Boolean,
            default: false,
        },
        isConnecting: {
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
            inputBidAmount: undefined as BigNumber | undefined,
        };
    },
    computed: {
        lowestNextBid(): BigNumber {
            // TODO: Fetch correct logic for this. Currently hardcoded to +5% for new bid
            return this.auction.bidAmountMKR ? this.auction.bidAmountMKR.multipliedBy(1.05) : new BigNumber(0);
        },
    },
});
</script>
