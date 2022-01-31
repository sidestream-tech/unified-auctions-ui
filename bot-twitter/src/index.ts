import NETWORKS from 'auctions-core/src/constants/NETWORKS';
import { setSigner } from 'auctions-core/src/signer';
import { getNewAuctions } from './auctions';
import notify from './notify';

const NETWORK = process.env.ETHEREUM_NETWORK || 'kovan';
const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

if (!NETWORKS[NETWORK]) {
    throw new Error(`network "${NETWORK}" is not supported`);
}

if (process.env.WALLET_PRIVATE_KEY) {
    setSigner(NETWORK, process.env.WALLET_PRIVATE_KEY).then(() => {});
}

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

loop().then(() => {});
