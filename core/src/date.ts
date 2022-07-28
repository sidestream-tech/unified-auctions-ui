import memoizee from 'memoizee';
import getProvider from './provider';
import { getNetworkConfigByType } from './network';

const CURRENT_BLOCK_DATE_CACHE_EXPIRY_MS = 60 * 1000;

export const fetchDateByBlockNumber = async function (
    network: string,
    blockNumber: number
): Promise<Date | undefined> {
    const provider = await getProvider(network);
    let block;
    try {
        block = await provider.getBlock(blockNumber);
    } catch (e) {
        console.error(e);
        return;
    }
    if (!block?.timestamp) {
        return;
    }
    return new Date(block.timestamp * 1000);
};

const fetchLatestBlockDate = async function (network: string): Promise<Date | undefined> {
    const provider = await getProvider(network);
    const blockNumber = await provider.getBlockNumber();
    return fetchDateByBlockNumber(network, blockNumber);
};

const _fetchLatestBlockDateAndCacheDate = async function (
    network: string
): Promise<{ blockDate: Date; cacheDate: Date } | undefined> {
    const blockDate = await fetchLatestBlockDate(network);
    if (!blockDate) {
        return undefined;
    }
    return {
        blockDate,
        cacheDate: new Date(),
    };
};

const fetchLatestBlockDateAndCacheDate = memoizee(_fetchLatestBlockDateAndCacheDate, {
    maxAge: CURRENT_BLOCK_DATE_CACHE_EXPIRY_MS,
    promise: true,
    length: 1,
});

const getNetworkDate = async function (network: string): Promise<Date | undefined> {
    const networkConfig = getNetworkConfigByType(network);
    if (!networkConfig.isFork) {
        return new Date();
    }
    const dateAndCache = await fetchLatestBlockDateAndCacheDate(network);
    if (!dateAndCache) {
        return;
    }
    return new Date(Date.now() - dateAndCache.cacheDate.getTime() + dateAndCache.blockDate.getTime());
};

export default getNetworkDate;
