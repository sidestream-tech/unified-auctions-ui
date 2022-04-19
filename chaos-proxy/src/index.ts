import 'dotenv/config';
import { chooseSimulationId } from './choose';
import { getSimulationUrl } from './api';
import { startProxy } from './proxy';

const CHAOSLABS_ACCESS_TOKEN = process.env.CHAOSLABS_ACCESS_TOKEN;
const CHAOSLABS_SIMULATIONS = process.env.CHAOSLABS_SIMULATIONS;
const PORT = parseInt(process.env.PORT || '8545');

(async function () {
    if (!CHAOSLABS_ACCESS_TOKEN) {
        throw new Error('CHAOSLABS_ACCESS_TOKEN is not set');
    }
    if (!CHAOSLABS_SIMULATIONS) {
        throw new Error('CHAOSLABS_SIMULATIONS is not set');
    }
    const simulationId = await chooseSimulationId(CHAOSLABS_SIMULATIONS);
    if (!simulationId) {
        console.info('Exiting since no simulation was selected');
        return;
    }
    const targetURL = await getSimulationUrl(CHAOSLABS_ACCESS_TOKEN, simulationId);
    await startProxy(targetURL, PORT);
})();
