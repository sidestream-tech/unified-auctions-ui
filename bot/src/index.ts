import { setTimeout as delay } from 'timers/promises';
import { setupRpcUrlAndGetNetworks } from 'auctions-core/src/rpc';
import { RPC_URL, SETUP_DELAY_MS, REFETCH_INTERVAL_MS } from './variables';
import { setupSupportedAuctionTypes, getSupportedAuctionTypes } from './supported';
import { setupWhitelistedCollaterals } from './whitelist';
import { setupTwitter } from './twitter';
import { setupCollateralKeeper } from './keepers/collateral';
import { setupDebtKeeper } from './keepers/debt';
import { loopCollateral } from './auctions/collateral';
import { loopDebt } from './auctions/debt';

const start = async function (): Promise<void> {
    await delay(SETUP_DELAY_MS);
    setupSupportedAuctionTypes();
    const { defaultNetwork: network } = await setupRpcUrlAndGetNetworks(RPC_URL);
    await setupTwitter();

    if (getSupportedAuctionTypes().includes('COLLATERAL')) {
        setupWhitelistedCollaterals();
        await setupCollateralKeeper(network);
        loopCollateral(network);
        setInterval(() => loopCollateral(network), REFETCH_INTERVAL_MS);
    }

    if (getSupportedAuctionTypes().includes('DEBT')) {
        await setupDebtKeeper(network);
        loopDebt(network);
        setInterval(() => loopDebt(network), REFETCH_INTERVAL_MS);
    }
};

start().catch(error => {
    throw error;
});

export default function () {} // required by nuxt
