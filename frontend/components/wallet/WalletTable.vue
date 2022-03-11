<template>
    <TextBlock>
        <Loading :is-loading="isLoading">
            <table class="w-full table-fixed border-collapse border">
                <tbody>
                    <tr>
                        <td>Wallet Address</td>
                        <td>
                            <FormatAddress
                                v-if="walletAddress"
                                type="address"
                                :value="walletAddress"
                                :shorten="true"
                            />
                            <span v-else class="opacity-50">Unknown</span>
                        </td>
                    </tr>
                    <tr>
                        <td>ETH amount in wallet</td>
                        <td>
                            <FormatCurrency v-if="walletETH" :value="walletETH" currency="ETH" />
                            <span v-else class="opacity-50">Unknown</span>
                        </td>
                    </tr>
                    <tr>
                        <td>DAI amount in wallet</td>
                        <td>
                            <FormatCurrency v-if="walletDAI" :value="walletDAI" currency="DAI" />
                            <span v-else class="opacity-50">Unknown</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Currently deposited in VAT</td>
                        <td>
                            <FormatCurrency v-if="walletVatDAI" :value="walletVatDAI" currency="DAI" />
                            <span v-else class="opacity-50">Unknown</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Last updated</td>
                        <td>
                            <TimeTill v-if="walletLastUpdatedDate" :date="walletLastUpdatedDate" />
                            <span v-else class="opacity-50">Unknown</span>
                            <BaseButton type="link" @click="$emit('refresh')"> Refresh </BaseButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </Loading>
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import FormatAddress from '../utils/FormatAddress.vue';
import FormatCurrency from '../utils/FormatCurrency.vue';
import TimeTill from '../common/TimeTill.vue';
import Loading from '../common/Loading.vue';
import BaseButton from '../common/BaseButton.vue';
import TextBlock from '../common/TextBlock.vue';

export default Vue.extend({
    name: 'WalletTable',
    components: { TextBlock, BaseButton, Loading, TimeTill, FormatCurrency, FormatAddress },
    props: {
        walletAddress: {
            type: String,
            default: null,
        },
        walletETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletVatDAI: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletLastUpdatedDate: {
            type: [String, Number, Date],
            default: null,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<style scoped>
th,
td {
    @apply p-2 border-2 border-collapse border-gray-300 dark:border-gray-600 dark:text-gray-200;
}

tr td:nth-child(2) {
    @apply text-right;
}
</style>
