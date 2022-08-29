import prompts, { PromptObject } from 'prompts';
import { SIMULATIONS } from './config';
import readline from 'readline';

const keypress = async () => {
    await prompts({
        type: 'invisible',
        name: 'irrelevant',
        message: 'Press Enter to continue',
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
        const answer = await prompts(promtConfig);
        const simulationConfig = SIMULATIONS.find(item => item.title === answer.value);
        if (!simulationConfig) {
            throw new Error(`Simulation config not found: ${answer.value}`);
        }
        for (const [i, step] of simulationConfig.steps.entries()) {
            console.log(`Next step: ${step.title}`)
            if (i !== 0) {
                await keypress();
            }
            console.info(`Executing: ${step.title}`);
            await step.entry();
            console.info(`Done: ${step.title}`);
        }
        console.info('Simulation completed');
    }
};

selectAndRunSimulation();
