<template>
    <div class="flex flex-col space-y-8 py-8">
        <WhatIsMakerProtocol v-if="isExplanationsShown" class="TextBlock"></WhatIsMakerProtocol>
        <template v-if="isExplanationsShown">
            <TextBlock title="What are vaults?" class="TextBlock">
                A vault is a main source of DAI in the MakerDAO protocol: anyone is able to deposit supported
                collateral into the system to get stablecoin in return and has to pay stability fees associated with
                the collateral type. The place where the collateral is deposited is called the vault and is solely
                managed by the person who deposited it, unless the deposited collateral amount no longer covers the
                withdrawn DAI.</TextBlock
            >
            <TextBlock title="When are vaults at risk?" class="TextBlock">
                Vaults become at risk when true value of the collateral in the vault is getting too close to the value
                of DAI withdrawn from the vault and hence the vault is no longer over collateralised enough. When
                market conditions change and the value of a deposited token decreases, users have to either return part
                of the withdrawn DAI or add collateral. If the original owner of the vault doesn't act in this
                situation, the vault can be liquidated by anyone to cover the missing DAI.
            </TextBlock>
            <TextBlock title="Why should I participate?" class="TextBlock">
                The user who liquidates a vault gets rewarded by two incentives: one is dependent on the collateral
                type and the other one is the percentage of the debt that needs to be covered. The participant receives
                the incentives during the liquidation transaction.
            </TextBlock>
            <TextBlock v-if="vaultTransactions.length > 0" title="Vaults at risk" class="TextBlock w-full">
                There {{ vaultTransactions.length === 1 ? 'is' : 'are' }} currently
                {{ vaultTransactions.length }} vault<span v-if="vaultTransactions.length !== 1">s</span>,
                {{ vaultsReadyToBeLiquidated }} of which {{ vaultsReadyToBeLiquidated === 1 ? 'is' : 'are' }} ready to
                be liquidated.
            </TextBlock>
            <!--
            TODO: Add back when we can correctly fetch vaults
            <TextBlock v-else title="No at risk vaults" class="TextBlock">
                There are currently not vaults at risk. You can check <nuxt-link to="/collateral">here</nuxt-link> to
                see if there are any ongoing collateral auctions.
            </TextBlock>
            -->
        </template>
        <div
            class="w-full self-center"
            :class="{ 'max-w-4xl': isExplanationsShown, 'md:px-10': !isExplanationsShown }"
        >
            <Alert type="info" show-icon>
                <div slot="message" class="font-bold">Specific vault address is required</div>
                <template slot="description">
                    <TextBlock>
                        Please provide a specific Sky vault address to see its state and be able to liquidate it. To
                        find currently active vaults please check relevant BlockAnalitica pages:
                        <a href="https://info.sky.money/collateral/core/cdps" target="_blank">Core Vaults</a>,
                        <a href="https://info.sky.money/collateral/seal-engine/cdps" target="_blank"
                            >Seal Engine Vaults</a
                        >.
                    </TextBlock>
                </template>
            </Alert>
            <div>
                <div style="margin-bottom: 16px" class="mt-4">
                    <Input
                        v-model="inputVaultAddress"
                        size="large"
                        placeholder="Enter vault address"
                        onkeydown="return event.keyCode !== 69 && event.keyCode !== 188"
                    >
                        <nuxt-link slot="addonAfter" :to="vaultInputLink"> View vault </nuxt-link>
                    </Input>
                </div>
            </div>
            <VaultsTable
                v-if="vaultTransactions && vaultTransactions.length !== 0"
                :vault-transactions="vaultTransactions"
                :show-more-rows="isExplanationsShown"
                :selected-vault-address="selectedVaultAddress"
                :last-updated="lastUpdated"
            />
        </div>
    </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import type { VaultTransaction } from 'auctions-core/src/types';
import { Alert, Input } from 'ant-design-vue';
import VaultsTable from './VaultsTable.vue';
import WhatIsMakerProtocol from '~/components/common/other/WhatIsMakerProtocol.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    components: {
        VaultsTable,
        TextBlock,
        WhatIsMakerProtocol,
        Alert,
        Input,
    },
    props: {
        vaultTransactions: {
            type: Array as PropType<VaultTransaction[]>,
            default: () => [],
        },
        isVaultsLoading: {
            type: Boolean,
            default: false,
        },
        vaultsError: {
            type: String,
            default: null,
        },
        selectedVaultAddress: {
            type: String,
            default: null,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        lastUpdated: {
            type: Date,
            default: null,
        },
        network: {
            type: String,
            default: 'mainnet',
        },
    },
    data() {
        return {
            inputVaultAddress: '',
        };
    },
    computed: {
        vaultInputLink(): string {
            const searchParams = new URLSearchParams({
                network: this.network,
                vault: this.inputVaultAddress,
            });
            return `/vaults?${searchParams.toString()}`;
        },
        vaultsReadyToBeLiquidated(): number {
            return this.vaultTransactions.filter(vault => {
                return vault.state === 'liquidatable';
            }).length;
        },
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}
</style>
