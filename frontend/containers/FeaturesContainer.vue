<template>
    <div class="FeaturesContainer">
        <FeaturesView />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import FeaturesView from '~/components/FeaturesView.vue';

export default Vue.extend({
    components: {
        FeaturesView,
    },
});
</script>

<style scoped>
.FeaturesContainer {
    min-height: calc(100vh - 9.8rem);
}
</style>
