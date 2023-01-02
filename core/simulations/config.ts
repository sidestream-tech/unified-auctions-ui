import { Simulation } from './types';
import debtAuctionSimulation from './configs/createDebtAuctionSimulation';
import surplusAuctionBlockchain from './configs/surplusAuctionSimulation';
import specificBlockFork from './configs/specificBlockFork';
import surplusAuctionSimulation from './configs/createSurplusAcutionSimulation';
import blockWithVaultsInAllStates from './configs/blocksWithVaultsInAllStates';
import vaultLiquidation from './configs/vaultLiquidation';
import onboardNewCollateral from './configs/onboardNewCollateral';

export const SIMULATIONS: Simulation[] = [
    vaultLiquidation,
    debtAuctionSimulation,
    surplusAuctionSimulation,
    surplusAuctionBlockchain,
    specificBlockFork,
    blockWithVaultsInAllStates,
    onboardNewCollateral,
];
