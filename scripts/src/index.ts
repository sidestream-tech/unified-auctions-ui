import 'dotenv/config';
import colors from 'ansi-colors';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/dist/src/rpc';
import { getEventDataFromCollaterals } from './events';
import { setupProgressBar } from './progress';
import { createAndExportSheet } from './xlsx';
import { ARROW_EMOJI, ERROR_EMOJI, NETWORK_EMOJI, RPC_URL } from './variables';
import { setupPrompts } from './prompt';

(async () => {
    const { defaultNetwork } = await setupRpcUrlAndGetNetworks(RPC_URL);
    console.info(`${ARROW_EMOJI}${NETWORK_EMOJI} Script running on network "${defaultNetwork}"`);

    const { dateLimit, fileName } = await setupPrompts();
    const progressBar = setupProgressBar(true);

    const { eventData, errors } = await getEventDataFromCollaterals(defaultNetwork, progressBar, dateLimit);
    progressBar.stop();
    if (errors) {
        console.info(
            `\n\n${ARROW_EMOJI}${ERROR_EMOJI} While running the script encountered ${errors.length} error${
                errors.length !== 1 ? 's' : ''
            }:`
        );
        errors.forEach(error => {
            console.error(`${colors.red(ARROW_EMOJI + error)}`);
        });
    }
    createAndExportSheet(eventData, fileName);
    process.exit(1);
})();
