import { ethers } from 'ethers';
import memoizee from 'memoizee';
import { getContractAddressByName, getContractInterfaceByName } from './contracts';
import getProvider from './provider';
import { OraclePrices, ValueExtractionConfig } from './types';
import BigNumber from './bignumber';
import { DAI_NUMBER_OF_DIGITS } from './constants/UNITS';
import { getCollateralConfigByType } from './constants/COLLATERALS';
import createStructCoder from './helpers/createStructCoder';

const CACHE_EXPIRY_MS = 30 * 1000;

export const getOracleAddressByCollateralType = async function (network: string, collateralType: string) {
    const collateralConfig = getCollateralConfigByType(collateralType);
    return await getContractAddressByName(network, `PIP_${collateralConfig.symbol}`);
};

const getNextOraclePriceChange = async (network: string, collateralType: string) => {
    const provider = await getProvider(network);
    const oracleAddress = await getOracleAddressByCollateralType(network, collateralType);
    const osmContractInterface = await getContractInterfaceByName('OSM');
    const osmContract = new ethers.Contract(oracleAddress, osmContractInterface, provider);
    const lastPriceUpdateTimestampInSeconds = parseInt((await osmContract.zzz())._hex, 16);
    if (!lastPriceUpdateTimestampInSeconds) {
        new Date(NaN);
    }
    const priceUpdateFrequencyInSeconds = await osmContract.hop();
    if (!priceUpdateFrequencyInSeconds) {
        new Date(NaN);
    }
    return new Date((lastPriceUpdateTimestampInSeconds + priceUpdateFrequencyInSeconds) * 1000);
};

const extractValuesFromAddress = async function (
    network: string,
    contractAddress: string,
    configs: ValueExtractionConfig[]
) {
    const provider = await getProvider(network);
    let values = {} as any;
    for (const config of configs) {
        const hexValues = await provider.getStorageAt(contractAddress, config.slotAddress);
        values = {
            ...values,
            ...createStructCoder(config.wordSize).decode(config.format, hexValues),
        };
    }
    return values;
};

const _getOsmPrices = async (network: string, collateralType: string): Promise<OraclePrices> => {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const oracleAddress = await getOracleAddressByCollateralType(network, collateralType);
    const prices = await extractValuesFromAddress(network, oracleAddress, collateralConfig.oracle);

    const currentUnitPrice = prices.isCurrentUnitPriceValid
        ? new BigNumber(prices.currentUnitPrice?._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS)
        : new BigNumber(NaN);
    const nextUnitPrice = prices.isNextUnitPriceValid
        ? new BigNumber(prices.nextUnitPrice?._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS)
        : new BigNumber(NaN);
    const nextPriceChange = !nextUnitPrice.isNaN()
        ? await getNextOraclePriceChange(network, collateralType)
        : new Date(NaN);

    return {
        currentUnitPrice,
        nextUnitPrice,
        nextPriceChange,
    };
};

export const getOsmPrices = memoizee(_getOsmPrices, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});
