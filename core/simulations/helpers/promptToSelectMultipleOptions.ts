import prompts from 'prompts';

const promptToSelectMultipleOptions = async (title: string, values: string[]) => {
    if (values.length <= 1) {
        return values[0];
    }
    const { selectedValues } = await prompts([
        {
            type: 'multiselect',
            name: 'selectedValues',
            message: title,
            choices: values.map(value => ({
                title: value,
                value: value,
            })),
        },
    ]);
    return selectedValues;
};

export default promptToSelectMultipleOptions;
