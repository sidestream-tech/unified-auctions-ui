import 'dotenv/config';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/dist/src/rpc';
import { generateCollateralStatsMessage, getEventDataFromCollaterals } from './events';
import { setupProgressBar } from './progress';
import { createAndExportSheet } from './xlsx';
import { setupPrompts } from './prompt';
import { ARROW_EMOJI, DEBUG_MODE, ERROR_EMOJI, NETWORK_EMOJI, RPC_URL } from './variables';
import { generateErrorsMessage } from './errors';

(async () => {
    if (DEBUG_MODE) {
        console.info(
            `${ARROW_EMOJI}${ERROR_EMOJI} Debug mode is enabled. Error messages will be shown in the console.`
        );
    }
    const { defaultNetwork } = await setupRpcUrlAndGetNetworks(RPC_URL);
    console.info(`${ARROW_EMOJI}${NETWORK_EMOJI} Script running on network "${defaultNetwork}"`);

    const { dateLimit, fileName } = await setupPrompts();
    const progressBar = setupProgressBar(true);

    const { eventData, errors, collateralStats } = await getEventDataFromCollaterals(
        defaultNetwork,
        progressBar,
        dateLimit
    );
    progressBar.stop();

    generateErrorsMessage(errors);
    generateCollateralStatsMessage(collateralStats, dateLimit);

    createAndExportSheet(eventData, collateralStats, fileName);
    process.exit(1);
})();
