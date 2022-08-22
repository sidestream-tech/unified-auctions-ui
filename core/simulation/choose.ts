import prompt, { Choice, PromptObject } from 'prompts';
import configurations, { KnownConfigs, ConfigConfigurations } from './configurations';
import scripts from './scripts';

const chooseScript = async (configuration: ConfigConfigurations) => {
    const promptedNameOptions: Choice[] = Object.entries(configuration).map(([configName, configBody]) => ({
        title: configBody.title,
        value: configName,
    }));
    const promptConfig: PromptObject = {
        type: 'select',
        name: 'simulation',
        message: 'Pick simulation script to execute',
        choices: promptedNameOptions,
    };
    return await prompt([promptConfig]);
};

const chooseArgsByScriptName = async (scriptName: KnownConfigs): Promise<Record<string, any>> => {
    const promtConfig = configurations[scriptName].configuration;
    return await prompt(promtConfig);
};

export const chooseSimulation = async () => {
    const scriptName = (await chooseScript(configurations)).simulation;
    const simulationArgs = await chooseArgsByScriptName(scriptName);
    await scripts.causeDebt(simulationArgs as any);
};

chooseSimulation();
