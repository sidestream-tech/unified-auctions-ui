import 'dotenv/config';
import { chooseSimulationId } from './choose';
import { getSimulationUrl } from './api';
import { startProxy } from './proxy';

const CHAOSLABS_ACCESS_TOKEN = process.env.CHAOSLABS_ACCESS_TOKEN;
const CHAOSLABS_SIMULATION_IDS = process.env.CHAOSLABS_SIMULATION_IDS;
const PORT = parseInt(process.env.PORT || '8545');

(async function () {
    if (!CHAOSLABS_ACCESS_TOKEN) {
        throw new Error('CHAOSLABS_ACCESS_TOKEN is not set');
    }
    if (!CHAOSLABS_SIMULATION_IDS) {
        throw new Error('CHAOSLABS_SIMULATION_IDS is not set');
    }
    const simulationId = await chooseSimulationId(CHAOSLABS_SIMULATION_IDS);
    const targetURL = await getSimulationUrl(CHAOSLABS_ACCESS_TOKEN, simulationId);
    startProxy(targetURL, PORT);
})();
