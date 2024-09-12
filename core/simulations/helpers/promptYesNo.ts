import prompts from 'prompts';

const promptYesNo = async (title: string, positive = 'yes', negative = 'no') => {
    const { answer } = await prompts([
        {
            type: 'toggle',
            name: 'answer',
            message: title,
            active: positive,
            inactive: negative,
        },
    ]);
    return answer;
};

export default promptYesNo;
