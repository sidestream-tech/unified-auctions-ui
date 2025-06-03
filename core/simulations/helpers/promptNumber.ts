import prompts from 'prompts';

interface BlockNumberPromt {
    title?: string;
    initial?: number;
    min?: number;
    max?: number;
}
const promptNumber = async (params?: BlockNumberPromt) => {
    const title: string = params?.title || 'Number';
    const min = params?.min || 0;
    const initial = params?.initial;
    const { number } = await prompts([
        {
            type: 'number',
            name: 'number',
            message: title,
            initial,
            min,
            max: params?.max,
        },
    ]);
    return number;
};

export default promptNumber;
