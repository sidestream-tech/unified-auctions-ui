<template>
    <div>
        <LandingBlock class="LandingBlock">
            <h1 class="text-gray-800 dark:text-gray-100">Features Overview</h1>
        </LandingBlock>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LandingBlock from '~/components/layout/LandingBlock.vue';

export default Vue.extend({
    components: {
        LandingBlock,
    },
});
</script>

<style scoped>
.LandingBlock {
    min-height: 33vh;
}
</style>
