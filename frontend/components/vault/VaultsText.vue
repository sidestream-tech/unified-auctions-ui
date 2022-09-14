<template>
    <div class="flex flex-col space-y-8 py-8">
        <Alert type="error" show-icon>
            <div slot="message" class="font-bold">UnifiedAuction Vaults is currently still in development!</div>
            <template slot="description"
                >A list of at risk vaults can currenlty not be fetched. If you wish to liqudate a specific vault,
                please navigate to
                <Explain :text="demoURL">
                    You can find a list of all vaults that are at risk
                    <a href="https://maker.blockanalitica.com/vaults-at-risk/" target="_blank">here</a>.
                </Explain>
            </template>
        </Alert>
        <WhatIsMakerProtocol v-if="isExplanationsShown" class="TextBlock"></WhatIsMakerProtocol>
        <template v-if="isExplanationsShown">
            <TextBlock title="What are vaults?" class="TextBlock">
                A vault is a main source of DAI in the MakerDAO protocol: anyone is able to deposit supported
                collateral into the system to get stablecoin in return and receive fees for the provided liquidity. The
                place where the collateral is deposited is called the vault and is solely managed by the person who
                deposited it, unless the deposited collateral amount no longer covers the withdrawn DAI.</TextBlock
            >
            <TextBlock title="When are vaults at risk?" class="TextBlock">
                Vaults become at risk when the amount of DAI withdrawn from the vault is getting too close to the true
                value of the collateral in the vault. When market conditions change and the value of a deposited token
                becomes less, users have to either return part of the withdrawn DAI or add collateral. If the original
                owner of the vault is inactive, part of the vault can be liquidated after a certain threshold by anyone
                else to cover missing DAI.
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
                be liquidated. {{ liquidatedVaults }} vault<span v-if="liquidatedVaults !== 1">s</span>
                {{ liquidatedVaults === 1 ? 'has' : 'have' }} already been liquidated.
            </TextBlock>
            <TextBlock v-else title="No at risk vaults" class="TextBlock">
                There are currently not vaults at risk. You can check <nuxt-link to="/collateral">here</nuxt-link> to
                see if there are any ongoing collateral auctions.
            </TextBlock>
        </template>
        <div
            class="w-full self-center"
            :class="{ 'max-w-4xl': isExplanationsShown, 'md:px-10': !isExplanationsShown }"
        >
            <!-- Add VaultsTable -->
        </div>
    </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import type { VaultTransaction } from 'auctions-core/src/types';
import { Alert } from 'ant-design-vue';
import WhatIsMakerProtocol from '~/components/common/other/WhatIsMakerProtocol.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        TextBlock,
        WhatIsMakerProtocol,
        Alert,
        Explain,
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
        selectedVaultId: {
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
    },
    computed: {
        demoURL(): string {
            return `${process.env.FRONTEND_ORIGIN || ''}/vaults?vault=COLLATERAL_ILK:VAULT_ID`;
        },
        liquidatedVaults(): number {
            let liquidatedVaults = 0;
            this.vaultTransactions.forEach(vault => {
                if (vault.state === 'liquidated') {
                    liquidatedVaults++;
                }
            });
            return liquidatedVaults;
        },
        vaultsReadyToBeLiquidated(): number {
            let vaultsReadyToBeLiquidated = 0;
            this.vaultTransactions.forEach(vault => {
                if (vault.state === 'liquidatable') {
                    vaultsReadyToBeLiquidated++;
                }
            });
            return vaultsReadyToBeLiquidated;
        },
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}
</style>
