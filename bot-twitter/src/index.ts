import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
import { createSigner, setSigner } from 'auctions-core/src/signer';
import { getNewAuctions } from './auctions';
import notify from './notify';
import { setupWallet } from './authorizations';

const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'kovan';
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;
let refetchIntervalId: ReturnType<typeof setTimeout> | undefined;

const loop = async function (): Promise<void> {
    if (refetchIntervalId) {
        clearInterval(refetchIntervalId);
    }
    try {
        const auctions = await getNewAuctions(ETHEREUM_NETWORK);
        auctions.map(notify);
        // auctions.map(participate);
    } catch (error) {
        console.error('loop error:', error);
    } finally {
        refetchIntervalId = setTimeout(loop, REFETCH_INTERVAL);
    }
};

const setup = async function (): Promise<void> {
    getNetworkConfigByType(ETHEREUM_NETWORK);
    if (WALLET_PRIVATE_KEY) {
        setSigner(ETHEREUM_NETWORK, createSigner(ETHEREUM_NETWORK, WALLET_PRIVATE_KEY));
        await setupWallet(ETHEREUM_NETWORK);
    }
    await loop();
};

setup().catch(error => {
    throw error;
});
