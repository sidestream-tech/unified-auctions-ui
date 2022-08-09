import 'dotenv/config';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import prompts from 'prompts';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/dist/src/rpc';
import { start } from './events';
import { RPC_URL } from './variables';
import { PROMPT_QUESTIONS } from './prompt';

(async () => {
    const { defaultNetwork } = await setupRpcUrlAndGetNetworks(RPC_URL);
    console.info(`Script running on network "${defaultNetwork}"`);

    const response = await prompts(PROMPT_QUESTIONS);

    const dateLimit =
        response.value !== '0'
            ? new Date(new Date().getFullYear(), new Date().getMonth() - response.value, new Date().getDate())
            : undefined;

    if (dateLimit) {
        console.info(`Fetching all events after ${dateLimit.toDateString()}`);
    } else {
        console.info(`Fetching all events.`);
    }

    const PROGRESS_BAR = new cliProgress.SingleBar(
        {
            format: colors.green('-[{bar}]-') + ' {percentage}% | {value}/{total} Collaterals | ETA: {eta_formatted}',
        },
        cliProgress.Presets.shades_classic
    );
    PROGRESS_BAR.start(100, 0);

    start(defaultNetwork, PROGRESS_BAR, dateLimit).catch(error => console.error(error));
})();
