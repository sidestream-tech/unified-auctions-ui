import getProvider from './provider';
import { getNetworkConfigByType } from './network';
import hre from 'hardhat';
import cache from './helpers/cache';

const CURRENT_BLOCK_DATE_CACHE_EXPIRY_MS = 60 * 1000;

export const fetchDateByBlockNumber = async function (
    network: string,
    blockNumber: number,
    isFork = false
): Promise<Date> {
    let block;
    if (isFork) {
        block = await hre.ethers.provider.getBlock('latest');
    } else {
        const provider = await getProvider(network);
        block = await provider.getBlock(blockNumber);
    }
    return new Date(block.timestamp * 1000);
};

export const fetchLatestBlockDate = async function (network: string, isFork: boolean): Promise<Date> {
    const provider = await getProvider(network);
    const blockNumber = await provider.getBlockNumber();
    return fetchDateByBlockNumber(network, blockNumber, isFork);
};

const _fetchLatestBlockDateAndCacheDate = async function (
    network: string,
    isFork: boolean
): Promise<{ blockDate: Date; cacheDate: Date }> {
    const blockDate = await fetchLatestBlockDate(network, isFork);
    return {
        blockDate,
        cacheDate: new Date(),
    };
};

export const fetchLatestBlockDateAndCacheDate = cache(_fetchLatestBlockDateAndCacheDate, {
    maxAge: CURRENT_BLOCK_DATE_CACHE_EXPIRY_MS,
    promise: true,
    length: 1,
});

const getNetworkDate = async function (network: string): Promise<Date> {
    const networkConfig = getNetworkConfigByType(network);
    if (!networkConfig.isFork) {
        return new Date();
    }
    const { blockDate, cacheDate } = await fetchLatestBlockDateAndCacheDate(network, networkConfig.isFork);
    return new Date(Date.now() - cacheDate.getTime() + blockDate.getTime());
};

export default getNetworkDate;
