import { Simulation } from './types';
import debtAuctionSimulation from './configs/createDebtAuctionSimulation';
import specificBlockFork from './configs/specificBlockFork';
import surplusAuctionSimulation from './configs/createSurplusAcutionSimulation';
import vaultLiquidation from './configs/vaultLiquidation';
import onboardNewCollateral from './configs/onboardNewCollateral';
import multipleVaultLiquidation from './configs/multipleVaultLiquidation';
import skipTime from './configs/skipTime';

export const SIMULATIONS: Simulation[] = [
    vaultLiquidation,
    debtAuctionSimulation,
    surplusAuctionSimulation,
    specificBlockFork,
    onboardNewCollateral,
    multipleVaultLiquidation,
    skipTime,
];
