import { setTimeout as delay } from 'timers/promises';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/src/rpc';
import { getAllAuctions, getNewAuctionsFromActiveAuctions } from './auctions';
import notify from './notify';
import participate, { setupKeeper } from './keeper';
import { RPC_URL } from './variables';
import { setupTwitter } from './twitter';
import { setupWhitelist } from './whitelist';
import { executePreAuthorizationsIfRequested } from './authorisation';

const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const SETUP_DELAY = 3 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;

const loop = async function (network: string): Promise<void> {
    try {
        const activeAuctions = await getAllAuctions(network);
        if (activeAuctions.length === 0) {
            return;
        }
        const newAuctions = getNewAuctionsFromActiveAuctions(activeAuctions);
        newAuctions.map(notify);
        participate(network, activeAuctions);
    } catch (error) {
        console.error('loop error:', error);
    }
};

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
    loop(network);
    setInterval(() => loop(network), REFETCH_INTERVAL);
};

start().catch(error => {
    throw error;
});

export default function () {} // required by nuxt
