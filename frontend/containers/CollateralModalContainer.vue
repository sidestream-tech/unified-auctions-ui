<template>
    <CollateralModal
        :is-shown="isCollateralModalShown"
        :is-dark-mode="isDarkMode"
        :is-explanations-shown="isExplanationsShown"
        :collateral-statuses="collateralStatuses"
        :is-authorizing="isAuthorizing"
        :is-withdrawing="isWithdrawing"
        @authorizeCollateral="authorize"
        @withdrawCollateral="withdraw"
        @cancel="setCollateralModal(false)"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import CollateralModal from '~/components/modals/CollateralModal.vue';

export default Vue.extend({
    name: 'CollateralModalContainer',
    components: { CollateralModal },
    computed: {
        ...mapGetters('collaterals', {
            collateralStatuses: 'collateralStatuses',
        }),
        ...mapGetters('modals', {
            isCollateralModalShown: 'getCollateralModal',
        }),
        ...mapGetters('wallet', {
            isWithdrawing: 'isDepositingOrWithdrawing',
        }),
        ...mapGetters('authorizations', {
            isAuthorizing: 'isAuthorizationLoading',
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
        isCollateralModalShown: {
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
        setCollateralModal(open: boolean): void {
            this.$store.commit('modals/setCollateralModal', open);
        },
        async authorize(collateralType: string) {
            await this.$store.dispatch('authorizations/authorizeCollateral', collateralType);
            await this.$store.dispatch('collaterals/refreshCollateralStatus', collateralType);
        },
        async withdraw(collateralType: string) {
            await this.$store.dispatch('wallet/withdrawAllCollateralFromVat', collateralType);
            await this.$store.dispatch('collaterals/refreshCollateralStatus', collateralType);
        },
    },
});
</script>
