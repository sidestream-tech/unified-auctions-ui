<template>
    <div class="PrivacyContainer">
        <PrivacyView />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import PrivacyView from '~/components/common/other/PrivacyView.vue';

export default Vue.extend({
    components: {
        PrivacyView,
    },
});
</script>

<style scoped>
.PrivacyContainer {
    min-height: calc(100vh - 9.8rem);
}
</style>
