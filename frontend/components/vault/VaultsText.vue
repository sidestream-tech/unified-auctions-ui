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
            <TextBlock title="What are vaults?" class="TextBlock"> TODO </TextBlock>
            <TextBlock title="When are vaults at risk?" class="TextBlock"> TODO </TextBlock>
            <TextBlock v-if="vaultTransactions.length > 0" title="Vaults at risk" class="TextBlock w-full">
                TODO
            </TextBlock>
            <TextBlock v-else title="No at risk vaults" class="TextBlock"> TODO </TextBlock>
        </template>
        <div
            class="w-full self-center"
            :class="{ 'max-w-4xl': isExplanationsShown, 'md:px-10': !isExplanationsShown }"
        >
            <!-- Add VaultsTable -->
        </div>
        <TextBlock v-if="isExplanationsShown" title="What is the catch?" class="TextBlock"> TODO </TextBlock>
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
    },
});
</script>

<style scoped>
.TextBlock {
    @apply max-w-screen-sm self-center;
}
</style>
