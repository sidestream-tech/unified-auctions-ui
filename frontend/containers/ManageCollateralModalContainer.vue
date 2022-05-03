<template>
    <ManageCollateralModal
        :is-shown="isManageCollateralModalShown"
        :is-dark-mode="isDarkMode"
        :is-explanations-shown="isExplanationsShown"
        :collateral-statuses="collateralStatuses"
        @authorizeCollateral="authorize"
        @withdrawCollateral="withdraw"
        @cancel="setManageCollateralModal(false)"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import ManageCollateralModal from '~/components/modals/ManageCollateralModal.vue';

export default Vue.extend({
    name: 'ManageCollateralModalContainer',
    components: { ManageCollateralModal },
    computed: {
        ...mapGetters('collaterals', {
            collateralStatuses: 'collateralStatuses',
        }),
        ...mapGetters('modals', {
            isManageCollateralModalShown: 'getManageCollateralModal',
        }),
        isExplanationsShown: {
            get() {
                return this.$store.getters['preferences/getIsExplanationsShown'];
            },
            set(newIsExplanationsShown) {
                this.$store.dispatch('preferences/setExplanationsAction', newIsExplanationsShown);
            },
        },
        isDarkMode: {
            get(): Boolean {
                return this.$store.getters['preferences/getIsDarkMode'];
            },
            set(newIsDarkMode) {
                this.$store.dispatch('preferences/setIsDarkMode', newIsDarkMode);
            },
        },
    },
    watch: {
        isManageCollateralModalShown: {
            immediate: true,
            handler(isShown) {
                if (isShown) {
                    this.$store.dispatch('collaterals/fetchCollateralStatuses');
                }
            },
        },
    },
    methods: {
        ...mapActions('wallet', ['withdrawAllCollateralFromVat']),
        setManageCollateralModal(open: boolean): void {
            this.$store.commit('modals/setManageCollateralModal', open);
        },
        async authorize(collateralType: string) {
            await this.$store.dispatch('authorizations/authorizeCollateral', collateralType);
        },
        async withdraw(collateralType: string) {
            await this.$store.dispatch('wallet/withdrawAllCollateralFromVat', collateralType);
        },
    },
});
</script>
