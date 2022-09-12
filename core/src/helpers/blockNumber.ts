import memoizee from 'memoizee';
import getProvider from '../provider';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const _fetchLatestBlockNumber = async (network: string) => {
    const provider = await getProvider(network);
    return await provider.getBlockNumber();
};

const fetchLatestBlockNumber = memoizee(_fetchLatestBlockNumber, {
    promise: true,
    length: 0,
    maxAge: CACHE_EXPIRY_MS,
});

export default fetchLatestBlockNumber;
