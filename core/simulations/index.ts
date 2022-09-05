import prompts, { PromptObject } from 'prompts';
import { SIMULATIONS } from './config';
import readline from 'readline';

const keypress = async (title: string) => {
    await prompts({
        type: 'invisible',
        name: 'irrelevant',
        message: `Press Enter to continue to step ${title}`,
    });
};

const selectAndRunSimulation = async () => {
    readline.emitKeypressEvents(process.stdin);
    const promtChoices = SIMULATIONS.map(simulationConfig => simulationConfig.title).map(simulationName => ({
        title: simulationName,
        value: simulationName,
    }));
    const promtConfig: PromptObject = {
        type: 'select',
        name: 'value',
        message: 'Select Simulation',
        choices: promtChoices,
    };
    while (true) {
        const selectedSimulation = await prompts(promtConfig);
        const simulationConfig = SIMULATIONS.find(simulation => simulation.title === selectedSimulation.value);
        if (!simulationConfig) {
            throw new Error(`Simulation config not found: ${selectedSimulation.value}`);
        }
        for (const [i, step] of simulationConfig.steps.entries()) {
            console.info(`Next step is "${step.title}"`);
            if (i !== 0) {
                await keypress(step.title);
            }
            await step.entry();
            console.info(`Step "${step.title}" is done.`);
        }
        console.info('Simulation completed');
    }
};

selectAndRunSimulation();
