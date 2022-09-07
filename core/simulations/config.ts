import debtAuctionSimulation from './configs/createDebtAuctionSimulation';
import surplusAuctionBlockchain from './configs/surplusAuctionSimulation';
import wstethAuctionSimulation from './configs/wstethAuctionSimulation';
import surplusAuctionSimulation from './configs/createSurplusAcutionSimulation';

export const SIMULATIONS = [
    debtAuctionSimulation,
    surplusAuctionBlockchain,
    surplusAuctionSimulation,
    wstethAuctionSimulation,
];
