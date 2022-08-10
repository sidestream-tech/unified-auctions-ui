<template>
    <div class="flex flex-col space-y-8 py-8">
        <WhatIsMakerProtocol v-if="isExplanationsShown" class="TextBlock"></WhatIsMakerProtocol>
        <TextBlock v-if="isExplanationsShown" title="What is the debt auction?" class="TextBlock">
            When a borrower's position becomes insufficiently collateralized a liquidation can be triggered. When this
            happens, the ownership of collateral and debt is automatically transferred from the borrower to the Maker
            Protocol. In an attempt to cancel out this newly assigned debt the collateral is auctioned off by the Maker
            Protocol.<br />
            An auction starts upon liquidation at a price higher than current market price. The price then drops
            gradually over time. An auction ends once all of the collateral is bought. The auction system allows for
            partial bids meaning a user is allowed to bid on parts of the auctioned collateral. Once an auction
            surpasses its maximum duration and there is still collateral to be auctioned off, it's terminated but can
            be restarted.
        </TextBlock>
        <TextBlock v-if="isExplanationsShown" title="Why would I participate?" class="TextBlock">
            There are market opportunities for arbitrage once the auction price for the collateral is lower than the
            selling price of this collateral on another marketplace.
        </TextBlock>
        <div
            class="w-full self-center"
            :class="{ 'max-w-4xl': isExplanationsShown, 'md:px-10': !isExplanationsShown }"
        >
            <!--DebtAuctionsTable goes here-->
        </div>
    </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { DebtAuctionTransaction } from 'auctions-core/src/types';
// import DebtAuctionsTable from '~/components/auction/debt/DebtAuctionsTable.vue';
import WhatIsMakerProtocol from '~/components/common/other/WhatIsMakerProtocol.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    name: 'DebtText',
    components: {
        WhatIsMakerProtocol,
        TextBlock,
        // DebtAuctionsTable,
    },
    props: {
        auctions: {
            type: Array as PropType<DebtAuctionTransaction[]>,
            default: () => [],
        },
        areAuctionsFetching: {
            type: Boolean,
            default: false,
        },
        auctionsError: {
            type: String,
            default: null,
        },
        selectedAuctionId: {
            type: Number,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        lastUpdated: {
            type: Date,
            default: null,
        },
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}
</style>
