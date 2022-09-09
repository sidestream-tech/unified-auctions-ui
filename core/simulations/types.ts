export declare interface SimulationStep {
    title: string;
    entry: CallableFunction;
}
export declare interface Simulation {
    readonly title: string;
    readonly steps: ReadonlyArray<SimulationStep>;
}
