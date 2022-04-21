import { setTimeout as delay } from 'timers/promises';
import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
import { getAllAuctions, getNewAuctionsFromActiveAuctions } from './auctions';
import notify from './notify';
import participate, { setupKeeper } from './keeper';
import { ETHEREUM_NETWORK } from './variables';
import { setupTwitter } from './twitter';

const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const SETUP_DELAY = 3 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;

const loop = async function (): Promise<void> {
    try {
        const activeAuctions = await getAllAuctions(ETHEREUM_NETWORK);
        if (activeAuctions.length === 0) {
            return;
        }
        const newAuctions = getNewAuctionsFromActiveAuctions(activeAuctions);
        newAuctions.map(notify);
        participate(activeAuctions);
    } catch (error) {
        console.error('loop error:', error);
    }
};

const start = async function (): Promise<void> {
    await delay(SETUP_DELAY);
    getNetworkConfigByType(ETHEREUM_NETWORK);
    await setupTwitter();
    await setupKeeper();
    loop();
    setInterval(loop, REFETCH_INTERVAL);
};

start().catch(error => {
    throw error;
});

export default function () {} // required by nuxt
