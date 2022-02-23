import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
import { createSigner, setSigner } from 'auctions-core/src/signer';
import { getAllActiveAuctions, getNewAuctionsFromActiveAuctions } from './auctions';
import notify from './notify';
import { setupWallet } from './authorizations';
import participate from './keeper';
import { ETHEREUM_NETWORK } from './variables';

const KEEPER_WALLET_PRIVATE_KEY = process.env.KEEPER_WALLET_PRIVATE_KEY;
const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;
let refetchIntervalId: ReturnType<typeof setTimeout> | undefined;

const loop = async function (): Promise<void> {
    if (refetchIntervalId) {
        clearInterval(refetchIntervalId);
    }
    try {
        const activeAuctions = await getAllActiveAuctions(ETHEREUM_NETWORK);
        const newAuctions = getNewAuctionsFromActiveAuctions(activeAuctions);

        activeAuctions.map(auction => participate(auction));
        newAuctions.map(notify);
    } catch (error) {
        console.error('loop error:', error);
    } finally {
        refetchIntervalId = setTimeout(loop, REFETCH_INTERVAL);
    }
};

const setup = async function (): Promise<void> {
    getNetworkConfigByType(ETHEREUM_NETWORK);
    if (KEEPER_WALLET_PRIVATE_KEY) {
        setSigner(ETHEREUM_NETWORK, createSigner(ETHEREUM_NETWORK, KEEPER_WALLET_PRIVATE_KEY));
        await setupWallet(ETHEREUM_NETWORK);
    }
    await loop();
};

setup().catch(error => {
    throw error;
});
