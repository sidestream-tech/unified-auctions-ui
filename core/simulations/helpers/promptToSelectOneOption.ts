import prompts from 'prompts';

const promptToSelectOneOption = async (title: string, values: string[]) => {
    if (values.length <= 1) {
        return values[0];
    }
    const { selectedValue } = await prompts([
        {
            type: 'select',
            name: 'selectedValue',
            message: title,
            choices: values.map(value => ({
                title: value,
                value: value,
            })),
        },
    ]);
    return selectedValue;
};

export default promptToSelectOneOption;
