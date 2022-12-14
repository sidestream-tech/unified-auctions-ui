import prompts from 'prompts';

const promptToGetNumber = async (title: string, initial: number) => {
    const { number } = await prompts([
        {
            type: 'number',
            name: 'number',
            message: title,
            initial,
            min: 1,
        },
    ]);
    return number;
};

export default promptToGetNumber;
