import { getNewAuctions } from './auctions';
import notify from './notify';
import { checkWalletAuthorization } from './authorizations';

const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;
let refetchIntervalId: ReturnType<typeof setInterval> | undefined;

const loop = async function (): Promise<void> {
    if (refetchIntervalId) {
        clearInterval(refetchIntervalId);
    }
    try {
        (await getNewAuctions()).map(notify);
        await checkWalletAuthorization();
    } catch (error) {
        console.error('loop: error', error);
    } finally {
        refetchIntervalId = setTimeout(loop, REFETCH_INTERVAL);
    }
};

loop();
