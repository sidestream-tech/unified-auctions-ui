<template>
    <form class="flex flex-col md:flex-row gap-4 items-end" @submit.prevent="submitForm">
        <div class="flex flex-col md:flex-row gap-4 w-full">
            <label class="w-full md:w-1/2">
                <TextBlock class="font-semibold text-xs">ChaosLabs access token</TextBlock>
                <Input v-model="inputToken" :disabled="isLoading || disabled || isStarted" />
            </label>
            <label class="w-full md:w-1/2">
                <TextBlock class="font-semibold text-xs">Simulation id</TextBlock>
                <Dropdown :trigger="['click']" :disabled="isLoading || disabled || isStarted" placement="bottomCenter">
                    <Input v-model="simulationId">
                        <template v-if="!noSimulationsAvailable" #suffix>
                            <Icon type="down" :style="{ color: '#ccc' }" />
                        </template>
                    </Input>
                    <Menu v-if="!noSimulationsAvailable" slot="overlay" @click="simulationId = $event.key">
                        <Item v-for="simulation in simulations" :key="simulation.value">
                            {{ simulation.label }}
                        </Item>
                    </Menu>
                </Dropdown>
            </label>
        </div>
        <BaseButton
            :type="hasValidVariables && !isStarted ? 'primary' : ''"
            class="w-48"
            :is-loading="isLoading"
            :disabled="disabled || !hasValidVariables"
            html-type="submit"
        >
            <span v-if="isLoading && isStarted">Resetting</span>
            <span v-else-if="isLoading">Starting</span>
            <span v-else-if="isStarted">Reset</span>
            <span v-else>Start Simulation</span>
        </BaseButton>
    </form>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon, Input, Dropdown, Menu } from 'ant-design-vue';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';

export default Vue.extend({
    components: {
        Input,
        BaseButton,
        TextBlock,
        Icon,
        Dropdown,
        Menu,
        Item: Menu.Item,
    },
    props: {
        token: {
            type: String,
            default: '',
        },
        simulationIds: {
            type: String,
            default: '',
        },
        isStarted: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            inputToken: this.token,
            simulationId: '',
        };
    },
    computed: {
        simulations(): SelectOption[] {
            return this.simulationIds
                .split(',')
                .map(id => ({
                    label: id.trim(),
                    value: id.trim(),
                }))
                .filter(simulation => simulation.label !== '');
        },
        noSimulationsAvailable(): boolean {
            return this.simulations.length < 1;
        },
        hasValidVariables(): boolean {
            return !!this.simulationId && !!this.inputToken.trim();
        },
    },
    methods: {
        submitForm() {
            this.$emit('submit', {
                token: this.inputToken.trim(),
                simulationId: this.simulationId.trim(),
            });
        },
    },
});
</script>
