<template>
    <TextBlock>
        <Loading :is-loading="isLoading">
            <table class="w-full table-fixed border-collapse border">
                <tbody>
                    <tr>
                        <td>Wallet Address</td>
                        <td>
                            <FormatAddress :value="walletAddress" :shorten="true" />
                        </td>
                    </tr>
                    <tr>
                        <td>ETH amount in wallet</td>
                        <td>
                            <FormatCurrency :value="walletETH" currency="ETH" />
                        </td>
                    </tr>
                    <tr>
                        <td>DAI amount in wallet</td>
                        <td>
                            <FormatCurrency :value="walletDAI" currency="DAI" />
                        </td>
                    </tr>
                    <tr>
                        <td>Currently deposited in VAT</td>
                        <td>
                            <FormatCurrency :value="walletVatDAI" currency="DAI" />
                        </td>
                    </tr>
                    <tr>
                        <td>Last updated</td>
                        <td>
                            <TimeTill :date="walletLastUpdatedDate" />
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
            required: true,
        },
        walletETH: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
        walletDAI: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
        walletVatDAI: {
            type: Object as Vue.PropType<BigNumber>,
            required: true,
        },
        walletLastUpdatedDate: {
            type: [String, Number, Date],
            required: true,
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
