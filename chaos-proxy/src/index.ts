import 'dotenv/config';
import { startProxy } from './proxy';
import { getSimulationUrl } from './api';

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
    const targetURL = await getSimulationUrl(CHAOSLABS_ACCESS_TOKEN, CHAOSLABS_SIMULATION_IDS);
    startProxy(targetURL, PORT);
})();
