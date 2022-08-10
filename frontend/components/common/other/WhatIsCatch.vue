<template>
    <TextBlock title="What is the catch?">
        This situation exists in the first place, because the Maker protocol can not be executed by itself. There need
        to be players who execute vital parts of the protocol and pay a
        <Explain text="transaction fee">
            Transaction fees are paid as <a href="https://ethereum.org/en/developers/docs/gas/">Gas</a> for the
            Ethereum network. It is the fuel that allows it to operate, in the same way, that a car needs gasoline to
            run.
        </Explain>
        for it. In a decentralised system like this, anyone can become such a player. But as execution can sometimes
        end up in a loss of transaction fee, those operations are made to be profitable by the protocol itself. Most of
        the auctions will be cleared by players with bots bidding very quickly, whenever there is a slight market
        opportunity.
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        TextBlock,
        Explain,
    },
});
</script>
