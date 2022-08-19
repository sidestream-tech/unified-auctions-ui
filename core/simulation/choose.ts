import prompt, { Choice, PromptObject } from 'prompts';
import configurations from './configurations.json';
import scripts from './scripts';

interface SimulationConfiguration {
    names: Record<string, string>;
    promts: Record<string, Array<PromptObject>>;
}

type KnownSimulations = 'causeDebt';

const chooseScript = async (configuration: SimulationConfiguration) => {
    const namesMap = configuration.names;
    const promptedNameOptions: Choice[] = Object.entries(namesMap).map(([functionName, functionDescription]) => {
        return {
            title: functionDescription,
            value: functionName,
        };
    });
    const promptConfig: PromptObject = {
        type: 'select',
        name: 'simulation',
        message: 'Pick simulation script to execute',
        choices: promptedNameOptions,
    };
    return await prompt([promptConfig]);
};

const chooseArgsByScriptName = async (scriptName: KnownSimulations): Promise<Record<string, any>> => {
    const promts = configurations.promts;
    const promtConfig = promts[scriptName] as PromptObject[];
    return await prompt(promtConfig);
};

export const chooseSimulation = async () => {
    const scriptName = (await chooseScript(configurations as SimulationConfiguration)).simulation;
    const simulationArgs = await chooseArgsByScriptName(scriptName);
    await scripts.causeDebt(simulationArgs as any);
};

chooseSimulation();
