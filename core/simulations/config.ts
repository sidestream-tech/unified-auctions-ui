import debtAuctionSimulation from './configs/createDebtAuctionSimulation';
import surplusAuctionBlockchain from './configs/surplusAuctionSimulation';
import wstethAuctionSimulation from './configs/wstethAuctionSimulation';
import surplusAuctionSimulation from './configs/createSurplusAcutionSimulation';

interface SimulationStep {
    title: string;
    entry: CallableFunction
}
interface Simulation {
    readonly title: string;
    readonly steps: ReadonlyArray<SimulationStep>;
}

export const SIMULATIONS: Simulation[] = [
    debtAuctionSimulation,
    surplusAuctionBlockchain,
    surplusAuctionSimulation,
    wstethAuctionSimulation,
];
