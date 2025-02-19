<template>
    <div class="DashboardContainer">
        <DashboardAuctionsView
            :collaterals="collaterals"
            :off-boarded-collaterals="offBoardedCollaterals"
            :callees="callees"
            :base-fee-per-gas="baseFeePerGas"
            :gas-parameters="gasParameters"
            :transaction-fees="transactionFees"
            :is-explanations-shown.sync="isExplanationsShown"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import type { CollateralRow } from 'auctions-core/src/types';
import { getCalleesByNetworkType } from 'auctions-core/src/constants/CALLEES';
import DashboardAuctionsView from '~/components/dashboard/DashboardAuctionsView.vue';

export default Vue.extend({
    components: {
        DashboardAuctionsView,
    },
    data() {
        return {
            offBoardedCollaterals: [],
        };
    },
    computed: {
        ...mapGetters('collaterals', {
            collaterals: 'collaterals',
        }),
        ...mapGetters('gas', {
            baseFeePerGas: 'getBaseFeePerGas',
            gasParameters: 'getGasParameters',
            transactionFees: 'getTransactionFees',
        }),
        network(): string | undefined {
            return this.$store.getters['network/getMakerNetwork'];
        },
        isExplanationsShown: {
            get(): boolean {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown): void {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        callees(): CalleeAddresses {
            const network = this.$store?.getters['network/getMakerNetwork'];
            if (!network) {
                return {};
            }
            return getCalleesByNetworkType(network);
        },
    },
    watch: {
        network() {
            if (this.network) {
                this.$store.dispatch('gas/setup');
                this.$store.dispatch('collaterals/setup');
            }
        },
        collaterals: {
            handler(newCollaterals: CollateralRow[]) {
                if (newCollaterals) {
                    newCollaterals.forEach(async collateral => {
                        if (await this.$store.dispatch('collaterals/isCollateralOffboarded', collateral.ilk)) {
                            if (!this.offBoardedCollaterals.includes(collateral.ilk)) {
                                this.offBoardedCollaterals.push(collateral.ilk);
                            }
                        }
                    });
                }
            },
            immediate: true,
        },
    },
});
</script>

<style scoped>
.DashboardContainer {
    min-height: calc(100vh - 9.8rem);
}
</style>
