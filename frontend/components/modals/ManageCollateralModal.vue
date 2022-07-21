<template>
    <modal
        :visible="isShown"
        :footer="null"
        :class="{ dark: isDarkMode }"
        title="Collaterals in VAT"
        :dialog-style="{ top: '60px' }"
        :width="650"
        destroy-on-close
        @cancel="$emit('cancel')"
    >
        <ManageCollateralTable
            class="p-4 overflow-auto"
            :is-explanations-shown="isExplanationsShown"
            :collateral-statuses="collateralStatuses"
            @authorizeCollateral="$emit('authorizeCollateral', $event)"
            @withdrawCollateral="$emit('withdrawCollateral', $event)"
        />
    </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { Modal } from 'ant-design-vue';
import { CollateralStatus } from 'auctions-core/src/types';
import ManageCollateralTable from '~/components/modals/ManageCollateralTable';

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
        collateralStatuses: {
            type: Array as Vue.PropType<CollateralStatus[]>,
            default: () => [],
        },
    },
});
</script>
