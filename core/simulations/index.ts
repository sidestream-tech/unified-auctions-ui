import prompts, { PromptObject } from 'prompts';
import { SIMULATIONS } from './config';
import readline from 'readline';
import keypress from '../helpers/keypress';

const selectAndRunSimulation = async () => {
    readline.emitKeypressEvents(process.stdin);
    const simulationChoices = SIMULATIONS.map(simulationConfig => simulationConfig.title).map(simulationName => ({
        title: simulationName,
        value: simulationName,
    }));
    const selectSimulationPrompt: PromptObject = {
        type: 'select',
        name: 'value',
        message: 'Select Simulation',
        choices: simulationChoices,
    };
    while (true) {
        const selectedSimulation = await prompts(selectSimulationPrompt);
        const simulationConfig = SIMULATIONS.find(simulation => simulation.title === selectedSimulation.value);
        if (!simulationConfig) {
            throw new Error(`Simulation config not found for "${selectedSimulation?.value}"`);
        }
        let context: Record<string, any> = {};
        for (const [i, step] of simulationConfig.steps.entries()) {
            if (i !== 0) {
                await keypress(`Press Enter to proceed to the next step "${step.title}"`);
            }
            const returnedValues = await step.entry(context);
            context = { ...context, ...(returnedValues ?? {}) };
            console.info(`Step "${step.title}" is successfully completed\n`);
        }
        console.info(`Simulation "${selectedSimulation.value}" is completed`);
        await keypress('Press Enter to start over');
    }
};

selectAndRunSimulation();
