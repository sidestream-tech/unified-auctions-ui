<template>
    <div class="flex flex-col space-y-8 py-8">
        <WhatIsMakerProtocol v-if="isExplanationsShown" class="TextBlock"></WhatIsMakerProtocol>
        <TextBlock v-if="isExplanationsShown" title="What are surplus auctions?" class="TextBlock">
            A
            <Explain text="surplus auction"
                >In Maker terms, surplus auctions are called
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/system-stabilizer-module/flap-detailed-documentation"
                    >flap auctions</a
                >
                and are operated via the
                <a href="https://github.com/makerdao/dss/blob/master/src/flap.sol">flap.sol contract</a></Explain
            >
            is the process of stabilizing DAI price, where excessive DAI tokens are auctioned off for the
            <Explain text="MKR tokens">
                Maker governance tokens that can be used to vote within Maker DAO and whose price algorithmically
                depends on the stability and prosperity of the Maker ecosystem </Explain
            >. The MKR obtained by the protocol is then automatically burned, reducing overall MKR supply and therefore
            increasing its price.
        </TextBlock>
        <TextBlock v-if="isExplanationsShown" title="Why would I participate?" class="TextBlock">
            Your participation can yield a profit by leveraging price differences between the auction price from the
            Maker Protocol and the price on other marketplaces. Similar to an English-style auction system, bidders
            compete with increasing amounts of MKR on the fixed amount of auctioned DAI. Once the auction has ended,
            the DAI auctioned off can be collected by the highest bidder. As long as the auction price is below the
            exchange rate on other marketplaces there is a chance to make a profit.
        </TextBlock>
        <TextBlock v-if="isExplanationsShown" title="What is the catch?" class="TextBlock">
            This situation exists in the first place, because the Maker protocol can not be executed by itself. There
            need to be players who execute vital parts of the protocol and pay a
            <Explain text="transaction fee">
                Transaction fees are paid as <a href="https://ethereum.org/en/developers/docs/gas/">Gas</a> for the
                Ethereum network. It is the fuel that allows it to operate, in the same way, that a car needs gasoline
                to run.
            </Explain>
            for it. In a decentralised system like this, anyone can become such a player. But as execution can
            sometimes end up in a loss of transaction fee, those operations are made to be profitable by the protocol
            itself. Most of the auctions will be cleared by players with bots bidding very quickly, whenever there is a
            slight market opportunity.
        </TextBlock>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import WhatIsMakerProtocol from '~/components/WhatIsMakerProtocol.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    components: {
        WhatIsMakerProtocol,
        TextBlock,
        Explain,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}
</style>
