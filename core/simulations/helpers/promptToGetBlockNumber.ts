import prompts from 'prompts';

import hre from 'hardhat';

interface BlockNumberPromt {
    title?: string;
    initial?: number;
    max?: number;
    min?: number;
}
const promptToGetBlockNumber = async (params?: BlockNumberPromt) => {
    const title: string = params?.title || 'Block number to fork from';
    const min = params?.min || 0;
    const initial = params?.initial;
    const max = params?.max ?? (await hre.ethers.provider.getBlockNumber());
    const { number } = await prompts([
        {
            type: 'number',
            name: 'number',
            message: title,
            initial: initial ?? max,
            min,
            max,
        },
    ]);
    return number;
};

export default promptToGetBlockNumber;
