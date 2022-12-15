import prompts from 'prompts';

const promptToGetNumber = async (title: string, initial: number, max: number, min = 1) => {
    const { number } = await prompts([
        {
            type: 'number',
            name: 'number',
            message: title,
            initial,
            min,
            max,
        },
    ]);
    return number;
};

export default promptToGetNumber;
