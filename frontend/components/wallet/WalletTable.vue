<template>
    <TextBlock>
        <Loading v-if="isLoading || walletAddress" :is-loading="isLoading">
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
                            <FormatCurrency v-if="walletBalances" :value="walletBalances.walletETH" currency="ETH" />
                            <span v-else class="opacity-50">Unknown</span>
                        </td>
                    </tr>
                    <tr>
                        <td>DAI amount in wallet</td>
                        <td>
                            <FormatCurrency v-if="walletBalances" :value="walletBalances.walletDAI" currency="DAI" />
                            <span v-else class="opacity-50">Unknown</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Currently deposited in VAT</td>
                        <td>
                            <FormatCurrency
                                v-if="walletBalances"
                                :value="walletBalances.walletVatDAI"
                                currency="DAI"
                            />
                            <span v-else class="opacity-50">Unknown</span>
                        </td>
                    </tr>
                    <tr>
                        <td>Last updated</td>
                        <td>
                            <TimeTill v-if="walletBalances" :date="walletBalances.walletLastUpdatedDate" />
                            <span v-else class="opacity-50">Unknown</span>
                            <BaseButton type="link" @click="$emit('refresh')"> Refresh </BaseButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </Loading>
        <WalletBlock
            v-else
            :wallet-address="walletAddress"
            :is-explanations-shown="isExplanationsShown"
            :is-loading="isWalletLoading"
            @connectWallet="$emit('connectWallet')"
        />
    </TextBlock>
</template>

<script lang="ts">
import Vue from 'vue';
import { WalletBalances } from 'auctions-core/src/types';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import Loading from '~/components/common/other/Loading.vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import WalletBlock from '~/components/wallet/WalletBlock.vue';

export default Vue.extend({
    name: 'WalletTable',
    components: { WalletBlock, TextBlock, BaseButton, Loading, TimeTill, FormatCurrency, FormatAddress },
    props: {
        walletAddress: {
            type: String,
            default: null,
        },
        walletBalances: {
            type: Object as Vue.PropType<WalletBalances>,
            default: null,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isWalletLoading: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
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
