import prompts from 'prompts';

const promptToGetNumber = async (title: string, initial: number, min = 1) => {
    const { number } = await prompts([
        {
            type: 'number',
            name: 'number',
            message: title,
            initial,
            min,
        },
    ]);
    return number;
};

export default promptToGetNumber;
