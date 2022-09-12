import debtAuctionSimulation from './configs/createDebtAuctionSimulation';
import surplusAuctionBlockchain from './configs/surplusAuctionSimulation';
import wstethAuctionSimulation from './configs/wstethAuctionSimulation';
import surplusAuctionSimulation from './configs/createSurplusAcutionSimulation';
import blockWithLiquidatableVault from './configs/blockWithLiquidatableVault';
import blockWithLiquidatedVault from './configs/blockWithLiquidatedVault';
import blockWithNotLiquidatableVault from './configs/blockWithNotLiquidatableVault';
import { Simulation } from './types';

export const SIMULATIONS: Simulation[] = [
    debtAuctionSimulation,
    surplusAuctionBlockchain,
    surplusAuctionSimulation,
    wstethAuctionSimulation,
    blockWithNotLiquidatableVault,
    blockWithLiquidatedVault,
    blockWithLiquidatableVault,
];
