import prompts from 'prompts';

import hre from 'hardhat';

interface BlockNumberPromt {
    title?: string;
    initial?: number;
    max?: number;
    min?: number;
}
const promptToGetNumber = async (params?: BlockNumberPromt) => {
    const title: string = params?.title || 'Block number to fork from';
    const min = params?.min || 0;
    const initial = params?.initial;
    const max = params?.initial;
    // only compute latest block if we need to fill values
    const latestBlock = max && initial ? undefined : await hre.ethers.provider.getBlockNumber();
    const { number } = await prompts([
        {
            type: 'number',
            name: 'number',
            message: title,
            initial: initial || latestBlock,
            min,
            max: max || latestBlock,
        },
    ]);
    return number;
};

export default promptToGetNumber;
