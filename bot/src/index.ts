import 'dotenv/config';
import { setTimeout as delay } from 'timers/promises';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/dist/src/rpc';
import { loopCollateral } from './auctions/collateral';
import { loopSurplus } from './auctions/surplus';
import { setupKeeper } from './keeper';
import { RPC_URL } from './variables';
import { setupTwitter } from './twitter';
import { setupWhitelist } from './whitelist';
import { executePreAuthorizationsIfRequested } from './authorisation';

const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const SETUP_DELAY = 3 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;

const start = async function (): Promise<void> {
    if (!RPC_URL) {
        throw new Error('Required `RPC_URL` env variable was not provided, please refer to the readme');
    }
    await delay(SETUP_DELAY);
    const { defaultNetwork: network } = await setupRpcUrlAndGetNetworks(RPC_URL);
    setupWhitelist();
    await setupTwitter();
    await setupKeeper(network);
    await executePreAuthorizationsIfRequested(network);

    loopCollateral(network);
    setInterval(() => loopCollateral(network), REFETCH_INTERVAL);

    loopSurplus(network);
    setInterval(() => loopSurplus(network), DEFAULT_REFETCH_INTERVAL);
};

start().catch(error => {
    throw error;
});
