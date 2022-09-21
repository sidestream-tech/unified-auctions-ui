import prompts from 'prompts';
import { getContractAddressByName } from './contracts';
import contractCollateralToOracleInterface from './abis/MCD_SPOT.json';
import contractOracleInterface from './abis/OSM.json';
import { ethers } from 'ethers';
import {
    generateMappingSlotAddress,
    overwriteUintValueInAddress,
    resetNetworkAndSetupWallet,
} from '../helpers/hardhat';
import BigNumber from './bignumber';
import { HARDHAT_PRIVATE_KEY, HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../helpers/constants';
import { CollateralType } from './types';
import getSigner from './signer';

const choicesYesNo = [
    { title: 'yes', value: true },
    { title: 'no', value: false },
];
const choicesNetwork = [{ title: 'custom', value: 'custom' }];
const HOW_TO_GUESS_SLOT_NUMBER = `
    For this step you must guess the slot number.
    1. Find the function that returns the variable, provide its name.
    2. Find the variable you're interested in the the smart contract.
    3. Count variables from top to bottom - what's the number of the variable you're interested in? Provide it.
    4. If the variable is less than 32B (e.g. uint256) provide the offset and length to indicate the start of the variable.

    Example for point (4):
        boolean takes up less than 32B of memory, the let's assume the returned value from slot address looks like '0x1000000000000000000000000000000000000000000000000000000000000000'.
        The offset is 3, length is 1.

`;
const promptCollateralType = async () => {
    const { collateralType }: { collateralType: CollateralType } = await prompts([
        {
            type: 'text',
            name: 'collateralType',
            message: 'State the collateral type. E.g. ETH-A',
            choices: choicesNetwork,
        },
    ]);
    return collateralType;
};
const promptBasicInformation = async () => {
    const { hasWhitelist, hasNextPrice }: { hasWhitelist: string; hasNextPrice: string } = await prompts([
        {
            type: 'select',
            name: 'hasWhitelist',
            choices: choicesYesNo,
            message: 'Does the contract have whitelisting for method execution?',
        },
        {
            type: 'select',
            name: 'hasNextPrice',
            choices: choicesYesNo,
            message: 'Does contract provide future price?',
        },
    ]);
    return { hasNextPrice, hasWhitelist };
};
const promptSlotNumberAndNewValue = async () => {
    console.info(HOW_TO_GUESS_SLOT_NUMBER);
    const { slot, newValue }: { slot: number; newValue: string } = await prompts([
        { type: 'number', name: 'slot', message: 'What is the slot number?' },
        { type: 'text', name: 'newValue', message: 'What is the new Value?' },
    ]);
    return { slot, newValue };
};
const promptPriceSourceConfig = async () => {
    const priceSourceConfig: {
        isCompleteSlot: boolean;
        currentPriceFunctionName: string;
        nextPriceFunctionName?: string;
    } = await prompts([
        {
            type: 'select',
            name: 'isCompleteSlot',
            message: 'Does the variable occupy 32B of memory? e.g. uint256 is 32B',
            choices: choicesYesNo,
        },
        {
            type: 'text',
            name: 'currentPriceFunctionName',
            message: 'What is the name of the function to read the current price from?',
        },
    ]);
    if (priceSourceConfig.isCompleteSlot) {
        const { functionName }: { functionName: string } = await prompts([
            {
                type: 'text',
                name: 'functionName',
                message: 'What is the name of the function to read the next price from?',
            },
        ]);
        priceSourceConfig.nextPriceFunctionName = functionName;
    }
    const offsetAndLength = priceSourceConfig.isCompleteSlot ? await promptOffsetAndLength() : undefined;
    return { ...offsetAndLength, ...priceSourceConfig };
};
const promptOffsetAndLength = async () => {
    const { offset, length }: { offset: number; length: number } = await prompts([
        { type: 'number', name: 'offset', message: 'What is the offset?' },
        { type: 'number', name: 'length', message: 'What is the length?' },
    ]);
    return {
        offset,
        length,
    };
};
const promptWhitelistSlotAndFunction = async () => {
    console.info(HOW_TO_GUESS_SLOT_NUMBER);
    const { whitelistSlot, whitelistFunction }: { whitelistSlot: string; whitelistFunction: string } = await prompts([
        {
            type: 'number',
            message: 'What is the slot of the whitelist mapping?',
            name: 'whitelistSlot',
        },
        {
            type: 'text',
            message: 'What is the function to check the whitelist?',
            name: 'whitelistFunction',
        },
    ]);
    return { whitelistSlot, whitelistFunction };
};
const promptTimeoutFunctionName = async () => {
    const { timeoutFunctionName }: { timeoutFunctionName: string } = await prompts([
        {
            type: 'text',
            message: 'What is the function name that provides timeout?',
            name: 'timeoutFunctionName',
        },
    ]);
    return timeoutFunctionName;
};
const getOracleAddressAndContract = async (collateralType: string) => {
    const signer = await getSigner(TEST_NETWORK);
    const contractOracleMapAdderss = await getContractAddressByName(TEST_NETWORK, 'MCD_SPOT');
    const contractOracleMap = new ethers.Contract(
        contractOracleMapAdderss,
        contractCollateralToOracleInterface,
        signer
    );
    const address: string = (await contractOracleMap.ilks(ethers.utils.formatBytes32String(collateralType))).pip;
    const contract = new ethers.Contract(address, contractOracleInterface, signer);
    return { contract, address };
};
const overwriteValue = async (contractAddress: string, newValue: BigNumber, slot: number) => {
    overwriteUintValueInAddress(contractAddress, ethers.utils.hexlify(slot), newValue);
};
const callContractFunctionOrThrow = async (contract: ethers.Contract, functionName: string, ...args: any[]) => {
    return await contract[functionName](...args);
};
const callFunction = async (contract: ethers.Contract, functionName: string, ...args: any[]): Promise<string> => {
    const returnedValueHex = await callContractFunctionOrThrow(contract, functionName, ...args);
    return returnedValueHex._hex;
};
const addToWhitelist = async (contractAddress: string, whitelistSlot: number) => {
    const slotAddress = generateMappingSlotAddress(`0x${whitelistSlot.toString(16)}`, HARDHAT_PUBLIC_KEY);
    await overwriteUintValueInAddress(contractAddress, slotAddress, new BigNumber(1));
};
const runOverwriteStep = async (
    contract: ethers.Contract,
    address: string,
    functionName: string,
    offset?: number,
    length?: number
) => {
    const previousValueRaw = await callFunction(contract, functionName);
    const previousValue = new BigNumber(
        offset && length ? previousValueRaw.substring(offset, offset + length) : previousValueRaw
    );
    const { slot, newValue } = await promptSlotNumberAndNewValue();
    await overwriteValue(address, new BigNumber(newValue), slot);
    const currentPriceRaw = await callFunction(contract, functionName);
    const currentPrice = new BigNumber(
        offset && length ? currentPriceRaw.substring(offset, offset + length) : currentPriceRaw
    );
    console.info(`Value returned before overwrite: ${previousValue}, Value returned after overwrite: ${currentPrice}`);
};
const run = async () => {
    await resetNetworkAndSetupWallet(undefined, HARDHAT_PRIVATE_KEY);
    const basicInfo = await promptBasicInformation();
    const collateralType = await promptCollateralType();
    const { contract, address } = await getOracleAddressAndContract(collateralType);
    console.info(`Contract address: ${address}`);
    if (basicInfo.hasWhitelist) {
        const { whitelistSlot, whitelistFunction } = await promptWhitelistSlotAndFunction();
        await addToWhitelist(address, parseInt(whitelistSlot));
        const isWhitelisted = await callFunction(contract, whitelistFunction, HARDHAT_PUBLIC_KEY);
        if (isWhitelisted === '0x00') {
            throw new Error('Failed to whitelist the wallet on the fork');
        }
    }
    const { isCompleteSlot, currentPriceFunctionName, nextPriceFunctionName, offset, length } =
        await promptPriceSourceConfig();
    console.info('Running current price overwrite');
    await runOverwriteStep(contract, address, currentPriceFunctionName, offset, length);
    if (isCompleteSlot && nextPriceFunctionName) {
        console.info('Determine the slot address of the timeout variable.');
        const timeoutFunctionName = await promptTimeoutFunctionName();
        console.info('Running timeout overwrite');
        await runOverwriteStep(contract, address, timeoutFunctionName);
        console.info('Running next price overwrite');
        await runOverwriteStep(contract, address, nextPriceFunctionName, offset, length);
    }
};
run();
