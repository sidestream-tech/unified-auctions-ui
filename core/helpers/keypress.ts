import prompts from 'prompts';
export const keypress = async (message: string) => {
    const userInput = await prompts({
        type: 'invisible',
        name: 'value',
        message,
    });
    if (userInput.value === undefined) {
        throw new Error('Simulation is terminated');
    }
};

export default keypress;
