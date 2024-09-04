<template>
    <div class="flex flex-col items-center w-full">
        <div class="flex flex-shrink-0 space-y-3 md:space-y-0 flex-col w-full md:w-auto md:space-x-10 md:flex-row">
            <button
                class="BaseButton"
                :class="selectedType === 'collateral' ? 'Selected' : 'Primary'"
                @click="selectType('collateral')"
            >
                Collateral auctions
            </button>
            <button
                class="BaseButton"
                :class="selectedType === 'debt' ? 'Selected' : 'Primary'"
                @click="selectType('debt')"
            >
                System debt auctions
            </button>
        </div>
        <div v-show="isExplanationsShown && selectedType" class="max-w-screen-sm mt-4 md:mt-8">
            <TextBlock v-show="selectedType == 'collateral'" title="Collateral auctions">
                The Maker Protocol allows users to borrow
                <Explain text="DAI">
                    <a href="https://makerdao.com/en/whitepaper#the-dai-stablecoin">The DAI Stablecoin</a> is a
                    decentralized, unbiased, collateral-backed cryptocurrency soft-pegged to the US Dollar
                </Explain>
                through locking up crypto assets as collateral in a vault. If the value of this collateral (in USD)
                falls too low the vault is liquidated and. In this process the collateral along with the vault’s debt
                is transferred to the Protocol. Part of the collateral is then auctioned off to cover the outstanding
                debt and a penalty fee.
            </TextBlock>
            <TextBlock v-show="selectedType == 'debt'" title="System debt auctions">
                If liquidations are not adequate in order to maintain Maker Protocol’s solvency meaning that overall
                debt hits a certain threshold and cannot be covered by accrued surplus, the Protocol will reduce its
                debt position by minting and selling MKR for DAI. This process is facilitated by debt auctions.
            </TextBlock>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';

export default Vue.extend({
    components: {
        TextBlock,
        Explain,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            selectedType: '',
        };
    },
    methods: {
        selectType(auctionType: string) {
            if (this.selectedType === auctionType) {
                this.selectedType = '';
            } else {
                this.selectedType = auctionType;
            }
            this.$emit('selected', this.selectedType);
        },
    },
});
</script>

<style scoped>
.BaseButton {
    @apply px-4 py-1.5 border-2 rounded-md font-semibold text-base md:text-lg;
}

.Primary {
    @apply border-primary-light text-primary hover:text-primary-light;
}

.Selected {
    @apply border-gray-400 bg-gray-400 text-white hover:bg-gray-300 hover:border-gray-300;
}
</style>
