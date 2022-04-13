import axios, { AxiosResponse } from 'axios';

const CHAOSLABS_API_BASEURL = 'https://chaoslabs.co';
const RETRY_TIMEOUT = 2 * 1000;

const executeAPIrequest = async function (
    accessToken: string,
    endpoint: string,
    data: any
): Promise<AxiosResponse<any, any>> {
    const url = new URL(`${CHAOSLABS_API_BASEURL}${endpoint}`);
    url.searchParams.append('chaos_token', accessToken);
    try {
        return await axios.post(url.toString(), data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        throw new Error(`Chaoslabs API request failed with error: ${error instanceof Error ? error.message : error}`);
    }
};

const startSimulationInstance = async function (accessToken: string, simulationID: string): Promise<string> {
    const response = await executeAPIrequest(accessToken, '/async_simulation', { simulationID });
    if (!response.data) {
        throw new Error('Simulation start error: no instanceId has been returned');
    }
    return response.data;
};

const fetchSimulationUrl = async function (accessToken: string, instanceId: string): Promise<string | undefined> {
    const response = await executeAPIrequest(accessToken, '/simulation_details', { id: instanceId });
    if (response.status === 404) {
        return undefined;
    }
    return response.data?.nodeUrl;
};

const waitForSimulationUrl = async function (accessToken: string, instanceId: string): Promise<string | undefined> {
    let simulationUrl = undefined;
    while (!simulationUrl) {
        await new Promise(resolve => setTimeout(resolve, RETRY_TIMEOUT));
        simulationUrl = await fetchSimulationUrl(accessToken, instanceId);
    }
    return simulationUrl;
};

export async function getSimulationUrl(accessToken: string, simulationId: string): Promise<string> {
    console.info(`Starting simulation "${simulationId}"...`);
    const instanceId = await startSimulationInstance(accessToken, simulationId);
    console.info(`Simulation "${simulationId}" started with instance id "${instanceId}". Waiting for the RPC url...`);
    const simulationUrl = await waitForSimulationUrl(accessToken, instanceId);
    if (!simulationUrl) {
        throw new Error('Failed to get Simulation RPC url');
    }
    console.info(`Simulation RPC url: "${simulationUrl}"`);
    return simulationUrl;
}
