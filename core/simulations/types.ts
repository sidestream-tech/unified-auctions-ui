type StepFuncton = (context: Record<string, any>) => Promise<Record<string, any> | void>;
export declare interface SimulationStep {
    title: string;
    entry: StepFuncton;
}
export declare interface Simulation {
    readonly title: string;
    readonly steps: ReadonlyArray<SimulationStep>;
}
