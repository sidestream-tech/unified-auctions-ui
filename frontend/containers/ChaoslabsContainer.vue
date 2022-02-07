<template>
    <div v-if="hasProperEnvVariables" class="flex flex-col gap-3">
        <div class="leading-3">Start ChaosLabs simulation:</div>
        <div class="flex gap-5">
            <BaseButton
                v-for="simulation in simulations"
                :key="simulation"
                :disabled="isSimulationInProgress"
                @click="startSimulation(simulation)"
                >{{ simulation }}</BaseButton
            >
        </div>
        <div
            v-if="logs.length > 0"
            class="font-mono text-xs flex flex-col gap-2 bg-gray-800 text-white p-2 rounded max-h-60 overflow-y-auto"
        >
            <div v-for="(log, index) in reversedLogs" :key="index">{{ log }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseButton from '~/components/common/BaseButton';

const API_BASEURL = 'https://chaoslabs.co';

export default Vue.extend({
    components: { BaseButton },
    props: {
        accessToken: {
            type: String,
            default: '',
        },
        simulationIds: {
            type: String,
            default: '',
        },
    },
    data: () => ({
        logs: [],
        isSimulationInProgress: false,
    }),
    computed: {
        reversedLogs() {
            return [...this.logs].reverse();
        },
        simulations(): string[] {
            return this.simulationIds
                .split(',')
                .map(id => id.trim())
                .filter(id => id);
        },
        hasProperEnvVariables(): boolean {
            return !!this.accessToken && this.simulations.length > 0;
        },
    },
    methods: {
        logEvent(text) {
            const formattedDate = new Date().toISOString();
            this.logs.push(`${formattedDate}: ${text}`);
        },
        async startSimulation(simulationId: string): void {
            this.isSimulationInProgress = true;
            this.logs = [];
            try {
                this.logEvent('Creating an instance...');
                const instanceId = await this.createInstanceId(simulationId);
                this.logEvent(`Instance "${instanceId}" created`);
                this.logEvent(`Retrieving instance state...`);
                let isInstanceReady = false;
                while (!isInstanceReady) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const instanceData = await this.getInstanceData(instanceId);
                    this.logEvent(`Instance state: "${instanceData.state}"`);
                    if (instanceData.state === 'simulation finished') {
                        isInstanceReady = true;
                        this.logEvent('Instance is ready');
                        this.logEvent(`Custom RPC url: ${instanceData.nodeUrl}`);
                        this.$emit('url', instanceData.nodeUrl);
                    }
                }
            } catch (error) {
                this.logEvent(`Error: "${error.message}"`);
            } finally {
                this.isSimulationInProgress = false;
            }
        },
        async createInstanceId(simulationId: string): string {
            const instanceData = await fetch(`${API_BASEURL}/async_simulation?chaos_token=${this.accessToken}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ simulationID: simulationId }),
            }).then(response => response.json());
            if (instanceData.error) {
                throw new Error(instanceData.error);
            }
            if (!instanceData) {
                throw new Error('/async_simulation response is empty');
            }
            return instanceData;
        },
        async getInstanceData(instanceId: string) {
            const instanceData = await fetch(`${API_BASEURL}/simulation_details?chaos_token=${this.accessToken}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: instanceId }),
            }).then(response => response.json());
            if (instanceData.error) {
                throw new Error(instanceData.error);
            }
            if (!instanceData.state) {
                throw new Error('/simulation_details status is empty');
            }
            return instanceData;
        },
    },
});
</script>
