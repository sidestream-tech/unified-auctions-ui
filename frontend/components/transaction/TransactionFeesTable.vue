<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div v-if="swapTransactionFeeETH" class="flex justify-between">
            <div>Swap Transaction Fee</div>
            <div>
                <FormatCurrency :value="swapTransactionFeeETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
        <div v-else-if="bidTransactionFeeETH" class="flex justify-between">
            <div>Bid Transaction Fee</div>
            <div>
                <FormatCurrency :value="bidTransactionFeeETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Wallet Authorization Fee <Icon v-if="isWalletAuthed" type="check" class="text-green-500" /></div>
            <div>
                <FormatCurrency :value="authTransactionFeeETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>
                Collateral Authorization Fee <Icon v-if="isCollateralAuthed" type="check" class="text-green-500" />
            </div>
            <div>
                <FormatCurrency :value="authTransactionFeeETH" :decimals="5" :currency="ETH" />
            </div>
        </div>
        <hr />
        <div class="flex justify-between font-bold">
            <div>Total</div>
            <div>
                <FormatCurrency
                    v-if="combinedSwapFeesETH"
                    :value="combinedSwapFeesETH"
                    :decimals="5"
                    :currency="ETH"
                />
                <FormatCurrency
                    v-else-if="combinedBidFeesETH"
                    :value="combinedBidFeesETH"
                    :decimals="5"
                    :currency="ETH"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    components: {
        FormatCurrency,
        Icon,
    },
    props: {
        swapTransactionFeeETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        bidTransactionFeeETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        authTransactionFeeETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        combinedSwapFeesETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        combinedBidFeesETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isWalletConnected: {
            type: Boolean,
            default: false,
        },
        isWalletAuthed: {
            type: Boolean,
            default: false,
        },
        isCollateralAuthed: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
