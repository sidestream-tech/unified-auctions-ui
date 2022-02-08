<template>
    <div class="my-3">
        <WalletBlock
            v-if="!walletAddress"
            class="mb-4"
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            @connectWallet="$emit('connect')"
        />
        <TextBlock v-if="isExplanationsShown">
            Auction that either has experienced a too steep decrease in price or has reached its time limit becomes
            inactive and requires interaction to be restarted. When restarted, a new price is calculated and a fresh
            time limit is set. Restarting an auction includes an
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
            that is sent to the participant’s wallet. However, this action incurs transaction fee of approximately
            <FormatCurrency :value="transactionFee" :decimals="5" currency="eth" />.
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <Tooltip :title="!walletAddress ? 'Please connect a wallet' : null" placement="top">
                <div>
                    <base-button
                        class="w-full md:w-80"
                        type="primary"
                        :is-loading="isRestarting"
                        :disabled="!walletAddress || isRestarting"
                        @click="$emit('restart')"
                    >
                        <span v-if="isRestarting">Restarting...</span>
                        <span v-else>Restart Auction</span>
                    </base-button>
                </div>
            </Tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import { Tooltip } from 'ant-design-vue';
import WalletBlock from './WalletBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import TextBlock from '~/components/common/TextBlock.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    name: 'RestartBlock',
    components: { TextBlock, BaseButton, FormatCurrency, Explain, Tooltip, WalletBlock },
    props: {
        transactionFee: {
            type: [Number, Object] as Vue.PropType<Number | BigNumber>,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isRestarting: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
