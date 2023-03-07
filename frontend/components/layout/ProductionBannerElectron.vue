<template>
    <Alert type="info" show-icon banner closable class="text-center">
        <template #message>
            You can now run the Unified Auctions UI locally as a desktop application. Please see its release at
            <a class="underline" :href="url" target="_blank">{{ url }}</a
            >.
        </template>
    </Alert>
</template>

<script lang="ts">
import Vue from 'vue';
import { Alert } from 'ant-design-vue';

export default Vue.extend({
    name: 'ProductionHeaderElectrong',
    components: { Alert },
    props: {
        url: {
            type: String,
            required: true,
        },
    },
});
</script>
