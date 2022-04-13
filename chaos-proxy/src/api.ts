import axios from 'axios';

const CHAOSLABS_API_BASEURL = 'https://chaoslabs.co';
const MAX_TIMEOUT = 120 * 1000;
const RETRY_TIMEOUT = 2 * 1000;

const buildAPIUrl = function (accessToken: string, endpoint: string): string {
    const url = new URL(`${CHAOSLABS_API_BASEURL}${endpoint}`);
    url.searchParams.append('chaos_token', accessToken);
    return url.toString();
};

const startSimulationInstance = async function (accessToken: string, simulationID: string): Promise<string> {
    const url = buildAPIUrl(accessToken, '/async_simulation');
    const response = await axios.post(
        url,
        {
            simulationID,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    if (!response.data) {
        throw new Error('Simulation start error: no instanceId has been returned');
    }
    return response.data;
};

const fetchSimulationUrl = async function (accessToken: string, instanceId: string): Promise<string | undefined> {
    const url = buildAPIUrl(accessToken, '/simulation_details');
    const response = await axios.post(
        url,
        {
            id: instanceId,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    if (response.status === 404) {
        return undefined;
    }
    return response.data?.nodeUrl;
};

const waitForSimluationUrl = async function (accessToken: string, instanceId: string): Promise<string | undefined> {
    let details = undefined;
    const totalTime = 0;
    while (!details && totalTime < MAX_TIMEOUT) {
        await new Promise(resolve => setTimeout(resolve, RETRY_TIMEOUT));
        details = await fetchSimulationUrl(accessToken, instanceId);
    }
    return details;
};

export async function getSimulationUrl(accessToken: string, simulationID: string): Promise<string> {
    const instanceId = await startSimulationInstance(accessToken, simulationID);
    console.info(`Simuattion started with instance id '${instanceId}'. Waiting for the RPC url...`);
    const simulationUrl = await waitForSimluationUrl(accessToken, instanceId);
    if (!simulationUrl) {
        throw new Error('Failed to get RPC URL');
    }
    console.info(`Simuattion RPC endpoint ${simulationUrl}`);
    return simulationUrl;
}
