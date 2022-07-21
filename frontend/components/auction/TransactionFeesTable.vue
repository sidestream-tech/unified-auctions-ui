<template>
    <div class="flex flex-col space-y-1 text-gray-700 dark:text-gray-100">
        <div class="flex justify-between">
            <div>
                <span class="capitalize">{{ fees.type }}</span> Transaction Fee
            </div>
            <div>
                <FormatCurrency :value="fees.transETH" :decimals="5" currency="ETH" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>Wallet Authorization Fee <Icon v-if="isWalletAuthed" type="check" class="text-green-500" /></div>
            <div>
                <FormatCurrency :value="fees.authETH" :decimals="5" currency="ETH" />
            </div>
        </div>
        <div class="flex justify-between">
            <div>
                Collateral Authorization Fee <Icon v-if="isCollateralAuthed" type="check" class="text-green-500" />
            </div>
            <div>
                <FormatCurrency :value="fees.authETH" :decimals="5" currency="ETH" />
            </div>
        </div>
        <hr v-if="isWalletConnected" />
        <div v-if="isWalletConnected" class="flex justify-between font-bold">
            <div>Remaining</div>
            <div>
                <FormatCurrency :value="totalFeesETH" :decimals="5" currency="ETH" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from 'ant-design-vue';
import BigNumber from 'bignumber.js';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    name: 'TransactionFeesTable',
    components: {
        FormatCurrency,
        Icon,
    },
    props: {
        fees: {
            type: Object,
            default: null,
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
    computed: {
        totalFeesETH(): BigNumber {
            let total = this.fees.transETH;

            if (!this.isWalletAuthed) {
                total = total.plus(this.fees.authETH);
            }

            if (!this.isCollateralAuthed) {
                total = total.plus(this.fees.authETH);
            }

            return total;
        },
    },
});
</script>
