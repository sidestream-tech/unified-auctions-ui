<template>
    <modal
        :visible="isShown"
        :footer="null"
        :class="{ dark: isDarkMode }"
        title="Collaterals"
        destory-on-close
        @cancel="$emit('cancel')"
    >
        <ManageCollateralTable
            class="px-4 py-2"
            :is-explanations-shown="isExplanationsShown"
            :authorizing-collaterals="authorizingCollaterals"
            :is-withdrawing="isWithdrawing"
            :collateral-statuses="collateralStatuses"
            @authorizeCollateral="$emit('authorizeCollateral', $event)"
            @withdrawCollateral="$emit('withdrawCollateral', $event)"
        />
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal } from 'ant-design-vue';
import ManageCollateralTable from '../ManageCollateralTable.vue';

export default Vue.extend({
    components: {
        Modal,
        ManageCollateralTable,
    },
    props: {
        isShown: {
            type: Boolean,
            default: false,
        },
        isDarkMode: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        authorizingCollaterals: {
            type: Array as Vue.PropType<String[]>,
            default: undefined,
        },
        isWithdrawing: {
            type: Boolean,
            default: false,
        },
        collateralStatuses: {
            type: Array as Vue.PropType<CollateralStatus[]>,
            default: undefined,
        },
    },
});
</script>
