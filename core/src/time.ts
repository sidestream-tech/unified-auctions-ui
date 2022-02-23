import memoizee from 'memoizee';
import getProvider from './provider';
import { getNetworkConfigByType } from './constants/NETWORKS';

const CURRENT_BLOCK_DATE_CACHE_EXPIRY_MS = 60 * 1000;

const fetchLatestBlockDate = async function (network: string): Promise<Date> {
    const provider = await getProvider(network);
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    return new Date(block.timestamp * 1000);
};

const _fetchLatestBlockDateAndCacheDate = async function (
    network: string
): Promise<{ blockDate: Date; cacheDate: Date }> {
    const blockDate = await fetchLatestBlockDate(network);
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

const getCurrentDate = async function (network: string): Promise<Date> {
    const networkConfig = getNetworkConfigByType(network);
    if (!networkConfig.isFork) {
        return new Date();
    }
    const { blockDate, cacheDate } = await fetchLatestBlockDateAndCacheDate(network);
    return new Date(Date.now() - cacheDate.getTime() + blockDate.getTime());
};

export default getCurrentDate;
