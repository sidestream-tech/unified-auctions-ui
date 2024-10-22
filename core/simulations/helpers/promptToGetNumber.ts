import prompts from 'prompts';

import hre from 'hardhat';

interface NumberPromt {
    title: string;
    initial?: number;
    min?: number;
    max?: number;
}

export const promptToGetNumber = async (params: NumberPromt) => {
    const { number } = await prompts([
        {
            type: 'number',
            name: 'number',
            message: params.title,
            initial: params?.initial ?? 0,
            min: params?.min ?? 0,
            max: params?.max,
        },
    ]);
    if (!number) {
        throw new Error('No number was provided');
    }
    return number;
};

export const promptToGetBlockNumber = async () => {
    const latestBlock = await hre.ethers.provider.getBlockNumber();
    return promptToGetNumber({
        title: 'Block number to fork from',
        initial: latestBlock,
        max: latestBlock,
    });
};
