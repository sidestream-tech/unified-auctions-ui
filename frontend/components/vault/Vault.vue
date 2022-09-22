<template>
    <TextBlock :title="`Vault #${vaultId}`">
        <div class="my-3">
            <Alert v-if="vaultError && vaultError.showBanner" :message="vaultError.error" type="error" />
        </div>
        <div v-if="vaultTransaction && vaultTransaction.state !== 'liquidated'">
            <div class="relative mt-2">
                <table class="w-full table-fixed border-collapse border">
                    <tbody>
                        <tr>
                            <td>Collateral Amount</td>
                            <td>
                                <format-currency
                                    v-if="vaultTransaction.collateralAmount && vaultTransaction.collateralType"
                                    :value="vaultTransaction.collateralAmount"
                                    :currency="vaultTransaction.collateralType"
                                />
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Proximity to liquidation threshold</td>
                            <td>
                                <template v-if="vaultTransaction.proximityToLiquidation">
                                    <AnimatedNumber :value="vaultTransaction.proximityToLiquidation" />%
                                </template>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Next price update</td>
                            <td>
                                <div v-if="vaultTransaction.nextPriceChange" class="flex items-center space-x-1">
                                    <AnimatedArrow
                                        :direction="getIsPriceGoingUpOrDown(vaultTransaction)"
                                        class="h-4 opacity-50"
                                    />
                                    <span>in <TimeTill :date="vaultTransaction.nextPriceChange" /></span>
                                </div>
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Last fetched</td>
                            <td>
                                <TimeTill v-if="vaultTransaction.lastSyncedAt" :date="vaultTransaction.lastSyncedAt" />
                                <span v-else class="opacity-50">Unknown</span>
                            </td>
                        </tr>
                        <template v-if="isTableExpanded">
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Current collateralization ratio</td>
                                <td>
                                    <template v-if="vaultTransaction.collateralizationRatio">
                                        <AnimatedNumber :value="vaultTransaction.collateralizationRatio" />%
                                    </template>
                                    <span v-else class="opacity-50">Unknown</span>
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Liquidation ratio</td>
                                <td>
                                    <template v-if="vaultTransaction.liquidationRatio">
                                        <AnimatedNumber :value="vaultTransaction.liquidationRatio" />%
                                    </template>
                                    <span v-else class="opacity-50">Unknown</span>
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Vault debt</td>
                                <td>
                                    <FormatCurrency
                                        v-if="vaultTransaction.initialDebtDai"
                                        :value="vaultTransaction.initialDebtDai"
                                        currency="DAI"
                                    />
                                    <span v-else class="opacity-50">Unknown</span>
                                </td>
                            </tr>
                            <tr class="bg-gray-100 dark:bg-gray-800">
                                <td>Vault address</td>
                                <td>
                                    <format-address
                                        v-if="vaultTransaction.address"
                                        :value="vaultTransaction.address"
                                        disable
                                    />
                                    <span v-else class="opacity-50">Unknown</span>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div v-if="error" class="Disable" />
            </div>
            <button
                class="
                    w-full
                    border-2 border-gray-300
                    p-1
                    border-t-0
                    text-center text-gray-400
                    dark:border-gray-600 dark:text-gray-600
                "
                @click="toggleExpandable"
            >
                {{ isTableExpanded ? 'Hide additional info' : 'Show additional info' }}
            </button>
            <template v-if="isExplanationsShown">
                <TextBlock class="mt-4">
                    <template v-if="!error">
                        The vault
                        <format-address type="address" :value="vaultTransaction.address" shorten disable /> contains
                        <format-currency
                            :value="vaultTransaction.collateralAmount"
                            :currency="vaultTransaction.collateralType"
                        />. The initial debt taken by the vault is
                        <format-currency :value="vaultTransaction.initialDebtDai" currency="DAI" />. The current
                        proximity to liquidation is
                        <AnimatedNumber :value="vaultTransaction.proximityToLiquidation" />. The next price update will
                        happen in <TimeTill :date="vaultTransaction.nextPriceChange" />.
                    </template>
                </TextBlock>
            </template>
            <TextBlock>
                <div class="flex w-full justify-end flex-wrap mt-4">
                    <Tooltip :title="error" placement="bottom">
                        <div>
                            <Button :disabled="!!error" type="primary" class="w-60 ml-4" @click="$emit('liquidate')">
                                Liquidate
                            </Button>
                        </div>
                    </Tooltip>
                </div>
            </TextBlock>
        </div>
        <div v-else-if="vaultTransaction && vaultTransaction.state === 'liquidated'">
            <Alert show-icon type="warning">
                <div slot="message">
                    <p>This vault has been liquidated into a collateral auction</p>
                    <div class="flex justify-end mt-2">
                        <nuxt-link :to="auctionLink">
                            <Button type="primary">
                                View collateral auction {{ vaultTransaction.pastLiquidations[0].auctionId }}
                            </Button>
                        </nuxt-link>
                    </div>
                </div>
            </Alert>
            <TextBlock class="mt-4">
                This vault was liquidated <TimeTill :date="vaultTransaction.pastLiquidations[0].liquidationDate" /> in
                the transaction <FormatAddress :value="vaultTransaction.pastLiquidations[0].transactionHash" />.
            </TextBlock>
        </div>
        <Loading v-else-if="areVaultsFetching" is-loading class="w-full self-center Loading h-48" />
    </TextBlock>
</template>

<script lang="ts">
import type { VaultTransaction, VaultTransactionNotLiquidated } from 'auctions-core/src/types';
import Vue from 'vue';
import { Alert, Tooltip } from 'ant-design-vue';
import { generateLink } from '~/helpers/generateLink';
import TimeTill from '~/components/common/formatters/TimeTill.vue';
import AnimatedArrow from '~/components/common/other/AnimatedArrow.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Button from '~/components/common/inputs/BaseButton.vue';
import FormatAddress from '~/components/common/formatters/FormatAddress.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';
import Loading from '~/components/common/other/Loading.vue';
import AnimatedNumber from '~/components/common/formatters/AnimatedNumber.vue';

export default Vue.extend({
    name: 'Vault',
    components: {
        AnimatedArrow,
        TimeTill,
        Loading,
        FormatCurrency,
        TextBlock,
        Button,
        FormatAddress,
        AnimatedNumber,
        Alert,
        Tooltip,
    },
    props: {
        vaultTransaction: {
            type: Object as Vue.PropType<VaultTransaction>,
            default: null,
        },
        vaultId: {
            type: String,
            required: true,
        },
        error: {
            type: String,
            default: '',
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        areVaultsFetching: {
            type: Boolean,
            default: false,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
    },
    data() {
        return {
            isTableExpanded: false,
        };
    },
    computed: {
        vaultError(): { error: string; showBanner: boolean } | null {
            if (this.error) {
                return {
                    error: this.error,
                    showBanner: true,
                };
            } else if (!this.areVaultsFetching && !this.vaultTransaction) {
                return {
                    error: 'This vault was not found',
                    showBanner: true,
                };
            } else if (!this.areVaultsFetching && this.vaultTransaction.state === 'liquidated') {
                return {
                    error: 'This vault has already been liquidated',
                    showBanner: false,
                };
            }
            return null;
        },
        auctionLink(): string | undefined {
            if (this.vaultTransaction.state !== 'liquidated' || !this.vaultTransaction.pastLiquidations[0].auctionId) {
                return undefined;
            }
            const link = generateLink(this.vaultTransaction.network, 'collateral');
            return `${link}&auction=${encodeURIComponent(this.vaultTransaction.pastLiquidations[0].auctionId)}`;
        },
    },
    watch: {
        isExplanationsShown: {
            immediate: true,
            handler(newIsExplanationsShown) {
                if (!newIsExplanationsShown) {
                    this.isTableExpanded = true;
                }
            },
        },
    },
    methods: {
        toggleExpandable(): void {
            this.isTableExpanded = !this.isTableExpanded;
        },
        getIsPriceGoingUpOrDown(vault: VaultTransactionNotLiquidated) {
            if (vault.nextUnitPrice.isGreaterThan(vault.currentUnitPrice)) {
                return 'up';
            }
            return 'down';
        },
    },
});
</script>

<style scoped>
th,
td {
    @apply p-2 border-2 border-collapse border-gray-300 dark:border-gray-600 dark:text-gray-200;
}
.Disable {
    @apply absolute inset-0 bg-gray-700 opacity-70;
}
</style>