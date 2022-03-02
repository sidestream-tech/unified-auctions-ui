import { setTimeout as delay } from 'timers/promises';
import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
import { getAllActiveAuctions, getNewAuctionsFromActiveAuctions } from './auctions';
import notify from './notify';
import participate, { setupKeeper } from './keeper';
import { ETHEREUM_NETWORK } from './variables';
import { setupTwitter } from './twitter';

const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const SETUP_DELAY = 3 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;
let refetchIntervalId: ReturnType<typeof setTimeout> | undefined;

const loop = async function (): Promise<void> {
    if (refetchIntervalId) {
        clearInterval(refetchIntervalId);
    }
    try {
        const activeAuctions = await getAllActiveAuctions(ETHEREUM_NETWORK);
        const newAuctions = getNewAuctionsFromActiveAuctions(activeAuctions);

        activeAuctions.map(auction =>
            participate(auction).catch(error => console.error(`participation error: ${error.message}`))
        );
        newAuctions.map(notify);
    } catch (error) {
        console.error('loop error:', error);
    } finally {
        refetchIntervalId = setTimeout(loop, REFETCH_INTERVAL);
    }
};

const setup = async function (): Promise<void> {
    await delay(SETUP_DELAY);
    getNetworkConfigByType(ETHEREUM_NETWORK);
    await setupTwitter();
    await setupKeeper();
    await loop();
};

setup().catch(error => {
    throw error;
});
