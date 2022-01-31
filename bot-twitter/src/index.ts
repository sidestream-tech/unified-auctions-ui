import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
import { setSigner } from 'auctions-core/src/signer';
import { getNewAuctions } from './auctions';
import notify from './notify';

const NETWORK = process.env.ETHEREUM_NETWORK || 'kovan';
const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

getNetworkConfigByType(NETWORK);

const loop = async function (): Promise<void> {
    if (refetchIntervalId) {
        clearInterval(refetchIntervalId);
    }
    try {
        (await getNewAuctions(NETWORK)).map(notify);
    } catch (error) {
        console.error('loop: error', error);
    } finally {
        refetchIntervalId = setTimeout(loop, REFETCH_INTERVAL);
    }
};

const setup = async function (): Promise<void> {
    if (process.env.WALLET_PRIVATE_KEY) {
        await setSigner(NETWORK, process.env.WALLET_PRIVATE_KEY);
    }
    await loop();
};

setup().catch(error => {
    throw error;
});
