import prompts, { PromptObject } from 'prompts';
import { SIMULATIONS } from './config';
import readline from 'readline';

const keypress = async (message: string) => {
    const userInput = await prompts({
        type: 'invisible',
        name: 'value',
        message,
    });
    if (userInput.value === undefined) {
        throw new Error('Simulation is terminated');
    }
};

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
        for (const [i, step] of simulationConfig.steps.entries()) {
            if (i !== 0) {
                await keypress(`Press Enter to proceed to the next step "${step.title}"`);
            }
            await step.entry();
            console.info(`Step "${step.title}" is successfully completed\n`);
        }
        console.info(`Simulation "${selectedSimulation.value}" is completed`);
        await keypress('Press Enter to start over');
    }
};

selectAndRunSimulation();
