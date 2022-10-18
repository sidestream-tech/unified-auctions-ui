<template>
    <div class="DashboardContainer">
        <DashboardAuctionsView
            :collaterals="collaterals"
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
import { getCalleesByNetworkType } from 'auctions-core/src/constants/CALLEES';
import DashboardAuctionsView from '~/components/dashboard/DashboardAuctionsView.vue';

export default Vue.extend({
    components: {
        DashboardAuctionsView,
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
    },
});
</script>

<style scoped>
.DashboardContainer {
    min-height: calc(100vh - 9.8rem);
}
</style>
