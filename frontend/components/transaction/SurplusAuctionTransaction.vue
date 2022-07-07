<template>
    <div>
        <TextBlock title="Surplus transaction" />
        <Alert
            v-if="auction.state === 'requires-restart'"
            message="This auction is inactive and must be restarted"
            type="error"
        />
        <Alert
            v-if="auction.state === 'ready-for-collection' || auction.state === 'collected'"
            message="This auction is finished"
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
            <div>WalletVatMkrBalanceCheckPanel goes here</div>
            <div>WalletDaiAuthorizationCheckPanel goes here</div>
            <div>WalletMkrAuthorizationCheckPanel goes here</div>
        </div>
        <div>HighestBidCheckPanel goes here</div>
        <div>WithdrawDaiFromVatPanel goes here</div>
    </div>
</template>

<script lang="ts">
import type { SurplusAuction } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert } from 'ant-design-vue';
import SurplusAuctionBidTransactionTable from './SurplusAuctionBidTransactionTable.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import WalletConnectionCheckPanel from '~/components/panels/WalletConnectionCheckPanel.vue';

export default Vue.extend({
    components: {
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
        walletAddress: {
            type: String,
            default: null,
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
        };
    },
    computed: {},
});
</script>
