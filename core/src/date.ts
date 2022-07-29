import memoizee from 'memoizee';
import getProvider from './provider';
import { getNetworkConfigByType } from './network';

const CURRENT_BLOCK_DATE_CACHE_EXPIRY_MS = 60 * 1000;

export const fetchDateByBlockNumber = async function (network: string, blockNumber: number): Promise<Date> {
    const provider = await getProvider(network);
    const block = await provider.getBlock(blockNumber);
    if (!block?.timestamp) {
        throw new Error('Received incorrect timestamp value');
    }
    return new Date(block.timestamp * 1000);
};

const fetchLatestBlockDate = async function (network: string): Promise<Date> {
    const provider = await getProvider(network);
    const blockNumber = await provider.getBlockNumber();
    return fetchDateByBlockNumber(network, blockNumber);
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

const getNetworkDate = async function (network: string): Promise<Date> {
    const networkConfig = getNetworkConfigByType(network);
    if (!networkConfig.isFork) {
        return new Date();
    }
    const { blockDate, cacheDate } = await fetchLatestBlockDateAndCacheDate(network);
    return new Date(Date.now() - cacheDate.getTime() + blockDate.getTime());
};

export default getNetworkDate;
