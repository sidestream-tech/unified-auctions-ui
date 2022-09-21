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
import {
    CollateralPriceSourceConfig,
    CollateralType,
    OracleCurrentAndNextPrices,
    OracleCurrentPriceOnly,
} from './types';
import getSigner from './signer';
import keypress from '../helpers/keypress';

const choicesYesNo = [
    { title: 'yes', value: true },
    { title: 'no', value: false },
];
const choicesNetwork = [{ title: 'custom', value: 'custom' }];
const CONFIG_WITH_NEXT_PRICE: OracleCurrentAndNextPrices = {
    type: 'CurrentAndNextPrice',
    currentPriceSlotAddress: '0x3',
    nextPriceSlotAddress: '0x4',
    hasDelay: true,
    slotPriceValueBeginsAtPosition: 34,
};
const CONFIG_WITHOUT_NEXT_PRICE: OracleCurrentPriceOnly = {
    type: 'CurrentPriceOnly',
    currentPriceSlotAddress: '0x2',
    hasDelay: false,
    currentPriceValiditySlotAndOffset: { slot: '0x1', offset: 25 },
    slotPriceValueBeginsAtPosition: 0,
};

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
    const { hasNextPrice }: { hasNextPrice: string } = await prompts([
        {
            type: 'select',
            name: 'hasNextPrice',
            choices: choicesYesNo,
            message: 'Does contract provide future price?',
        },
    ]);
    return {
        hasNextPrice,
    };
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

const overwriteValue = async (contractAddress: string, newValue: BigNumber, slot: string) => {
    overwriteUintValueInAddress(contractAddress, slot, newValue);
};

const callContractFunctionOrThrow = async (contract: ethers.Contract, functionName: string, ...args: any[]) => {
    try {
        return await contract[functionName](...args);
    } catch (e) {
        throw new Error(`Failed to run the function ${functionName}: ${e}`);
    }
};

const callFunction = async (contract: ethers.Contract, functionName: string, ...args: any[]): Promise<string> => {
    const returnedValueHex = await callContractFunctionOrThrow(contract, functionName, ...args);
    return returnedValueHex;
};

const addToWhitelist = async (contractAddress: string, whitelistSlot: number) => {
    const slotAddress = generateMappingSlotAddress(`0x${whitelistSlot.toString(16)}`, HARDHAT_PUBLIC_KEY);
    await overwriteUintValueInAddress(contractAddress, slotAddress, new BigNumber(1));
};

const runOverwriteStep = async (
    contract: ethers.Contract,
    address: string,
    functionName: string,
    slot: string,
    valueIndex?: number,
    valueToWrite?: BigNumber
) => {
    const previousValueRaw = await callFunction(contract, functionName);
    const previousValue = new BigNumber(valueIndex !== undefined ? previousValueRaw[valueIndex] : previousValueRaw);
    await overwriteValue(address, valueToWrite || previousValue.plus(1), slot);
    const currentValueRaw = await callFunction(contract, functionName);
    const currentValue = new BigNumber(valueIndex !== undefined ? currentValueRaw[valueIndex] : currentValueRaw);
    const isUnchanged = previousValue.eq(currentValue);
    if (isUnchanged) {
        throw new Error('Slot was not specified correctly.');
    }
};

const validateConfigWithNextPriceIsValid = async (contract: ethers.Contract, address: string) => {
    const priceValiditySlotValue = await contract.provider.getStorageAt(
        address,
        CONFIG_WITH_NEXT_PRICE.currentPriceSlotAddress
    );
    if (priceValiditySlotValue[CONFIG_WITH_NEXT_PRICE.slotPriceValueBeginsAtPosition - 1] !== '1') {
        throw new Error('Failed to discover the price validity boolean position');
    }
    await runOverwriteStep(contract, address, 'peek', CONFIG_WITH_NEXT_PRICE.currentPriceSlotAddress, 0);
    await runOverwriteStep(contract, address, 'peep', CONFIG_WITH_NEXT_PRICE.nextPriceSlotAddress, 0);
};

const validateConfigWithoutNextPriceIsValid = async (contract: ethers.Contract, address: string) => {
    const valueAtSlot = await contract.provider.getStorageAt(
        address,
        CONFIG_WITHOUT_NEXT_PRICE.currentPriceValiditySlotAndOffset.slot
    );
    console.log(valueAtSlot);
    if (valueAtSlot[CONFIG_WITHOUT_NEXT_PRICE.currentPriceValiditySlotAndOffset.offset] !== '1') {
        throw new Error('Failed to discover the price validity boolean position');
    }
    await runOverwriteStep(
        contract,
        address,
        'peek',
        CONFIG_WITHOUT_NEXT_PRICE.currentPriceSlotAddress,
        CONFIG_WITHOUT_NEXT_PRICE.slotPriceValueBeginsAtPosition
    );
};

const run = async () => {
    let config: CollateralPriceSourceConfig;
    await keypress('Press enter to start collateral config generation')
    await resetNetworkAndSetupWallet(undefined, HARDHAT_PRIVATE_KEY);
    const basicInfo = await promptBasicInformation();
    config = basicInfo.hasNextPrice ? CONFIG_WITH_NEXT_PRICE : CONFIG_WITHOUT_NEXT_PRICE;
    const collateralType = await promptCollateralType();
    const { contract, address } = await getOracleAddressAndContract(collateralType);
    console.info(`Contract address: ${address}`);
    if (basicInfo.hasNextPrice) {
        const whitelistSlot = 5;
        const whitelistFunction = 'bud';
        await addToWhitelist(address, whitelistSlot);
        const isWhitelisted = await callFunction(contract, whitelistFunction, HARDHAT_PUBLIC_KEY);
        if (isWhitelisted === '0x00') {
            throw new Error('Failed to whitelist the wallet on the fork');
        }
    }
    if (basicInfo.hasNextPrice) {
        await validateConfigWithNextPriceIsValid(contract, address);
    } else {
        await validateConfigWithoutNextPriceIsValid(contract, address);
    }
    console.info(`The config is validated: \n ${JSON.stringify(config)}`);
};
run();
