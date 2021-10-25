<template>
    <div class="my-3">
        <TextBlock v-if="isExplanationsShown">
            If an auction either has experienced a too steep decrease in price or has reached its time limit, it
            becomes inactive and requires interaction to be restarted by calling functions of the Maker Protocol. It
            then restarts at a new calculated price and a fresh duration. Restarting an auction includes an
            <Explain text="incentive">
                The
                <a
                    href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#liquidation-incentive-mechanism"
                    target="_blank"
                >
                    incentive
                </a>
                consist of two positions:
                <ul class="list-inside list-decimal">
                    <li class="my-2">
                        An on a per-collateral type basis, constant amount of DAI →
                        <a
                            href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#clipper-chip-wad"
                            target="_blank"
                        >
                            Chip
                        </a>
                    </li>
                    <li class="my-2">
                        An amount of DAI that scales linearly with the amount of debt associated with the liquidation →
                        <a
                            href="https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation#clipper-tip-rad"
                            target="_blank"
                        >
                            Tip
                        </a>
                    </li>
                </ul>
            </Explain>
            that is sent to the participant’s wallet. However, this action incurs transaction fees and if you’re
            bidding with other participants at the same time, the one who pays a higher transaction fee has more
            chances to win the auction. In case your transaction will be rejected, it only results in the loss of the
            transaction fee. Approximate fee: <FormatCurrency :value="value" :decimals="6" currency="eth" />.
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button class="w-full md:w-80" type="primary" @click="$emit('restart')">
                Restart Auction
            </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BaseButton from '~/components/common/BaseButton.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    name: 'RestartBlock',
    components: { TextBlock, BaseButton, FormatCurrency, Explain },
    props: {
        value: {
            type: [Number, BigNumber] as Vue.PropType<Number | BigNumber>,
            required: true,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
});
</script>
