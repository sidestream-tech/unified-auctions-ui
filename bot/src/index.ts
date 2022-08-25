import { setTimeout as delay } from 'timers/promises';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/src/rpc';
import { loopCollateral } from './auctions/collateral';
import { loopSurplus } from './auctions/surplus';
import { setupKeeper } from './keeper/setup';
import {
    RPC_URL,
    KEEPER_COLLATERAL,
    KEEPER_SURPLUS,
    KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI,
    KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI,
} from './variables';
import { loopDebt } from './auctions/debt';
import { setupTwitter } from './twitter';
import { setupWhitelist } from './whitelist';

const DEFAULT_REFETCH_INTERVAL = 60 * 1000;
const SETUP_DELAY = 3 * 1000;
const REFETCH_INTERVAL = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL;

const start = async function (): Promise<void> {
    if (!RPC_URL) {
        throw new Error('Required `RPC_URL` env variable was not provided, please refer to the readme');
    }
    await delay(SETUP_DELAY);
    const { defaultNetwork: network } = await setupRpcUrlAndGetNetworks(RPC_URL);
    setupWhitelist();
    await setupTwitter();
    await setupKeeper(network);

    if (KEEPER_COLLATERAL && !Number.isNaN(KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI)) {
        loopCollateral(network);
        setInterval(() => loopCollateral(network), REFETCH_INTERVAL);
    }

    if (KEEPER_SURPLUS && !Number.isNaN(KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI)) {
        loopSurplus(network);
        setInterval(() => loopSurplus(network), DEFAULT_REFETCH_INTERVAL);
    }

    loopDebt(network);
    setInterval(() => loopDebt(network), DEFAULT_REFETCH_INTERVAL);
};

start().catch(error => {
    throw error;
});

export default function () {} // required by nuxt
