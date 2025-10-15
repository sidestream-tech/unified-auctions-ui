import { getContractAddressByName, getContractInterfaceByName, getOracleWrapperOsmByAddress } from './contracts';
import getProvider from './provider';
import {
    CollateralPriceSourceConfig,
    OraclePrices,
    OracleCurrentPriceOnly,
    OracleCurrentAndNextPrices,
    OracleCappedWrapper,
    CollateralType,
} from './types';
import BigNumber from './bignumber';
import { ethers } from 'ethers';
import { DAI_NUMBER_OF_DIGITS } from './constants/UNITS';
import memoizee from 'memoizee';
import { getCollateralConfigByType } from './constants/COLLATERALS';

const CACHE_EXPIRY_MS = 60 * 1000;

export const getOracleAddressByCollateralType = async function (network: string, collateralType: string) {
    const collateralConfig = getCollateralConfigByType(collateralType);
    return await getContractAddressByName(network, collateralConfig.contracts.pip);
};

const getOraclePriceSameSlotValidity = async (
    slot: string,
    slotPriceValueBeginsAtPosition: number,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
) => {
    /**
     * Fetch the price by direct memory access (via slot address)
     * The price is stored in the same slot as a validity marker:
     *   - split the received value into validity marker part and price part
     * If the price is valid - return it, otherwise provide a NaN
     **/
    const priceAndValidityHex = await provider.getStorageAt(oracleAddress, slot);
    const isPriceValid = priceAndValidityHex.substring(0, slotPriceValueBeginsAtPosition);
    if (parseInt(isPriceValid, 16) === 1) {
        return new BigNumber(`0x${priceAndValidityHex.substring(slotPriceValueBeginsAtPosition)}`).shiftedBy(
            -DAI_NUMBER_OF_DIGITS
        );
    }
    return new BigNumber(NaN);
};

const nextPriceExtractors: Record<CollateralPriceSourceConfig['type'], CallableFunction> = {
    CurrentPriceOnly: () => new BigNumber(NaN),
    CurrentAndNextPrice: async (
        oracle: OracleCurrentAndNextPrices,
        provider: ethers.providers.JsonRpcProvider,
        oracleAddress: string
    ) => {
        return await getOraclePriceSameSlotValidity(
            oracle.nextPriceSlotAddress,
            oracle.slotPriceValueBeginsAtPosition,
            provider,
            oracleAddress
        );
    },
    CappedWrapper: async (
        oracle: OracleCappedWrapper,
        provider: ethers.providers.JsonRpcProvider,
        oracleAddress: string
    ) => {
        const osmAddress = await getOracleWrapperOsmByAddress(oracleAddress, provider);
        return await nextPriceExtractors[oracle.oracle.type](oracle.oracle, provider, osmAddress);
    },
};

function getNextOraclePrice(
    oracle: CollateralPriceSourceConfig,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
) {
    return nextPriceExtractors[oracle.type](oracle, provider, oracleAddress);
}

const currentPriceExtractors: Record<CollateralPriceSourceConfig['type'], CallableFunction> = {
    CurrentPriceOnly: async (
        oracle: OracleCurrentPriceOnly,
        provider: ethers.providers.JsonRpcProvider,
        oracleAddress: string
    ) => {
        /**
         * Get current price from the contract via direct memory access (slot address)
         * The price is stored in separate slot as a validity marker:
         *   - the marker might be stored in the same slot as some other irrelevent value
         *   - extract the byte that contains validity marker only
         * If the price is valid - return it, otherwise provide a NaN
         **/
        const currentPriceFeed = await provider.getStorageAt(oracleAddress, oracle.currentPriceSlotAddress);
        const slotPriceValueBeginsAtPosition = oracle.slotPriceValueBeginsAtPosition;
        const priceValiditySlotValue = await provider.getStorageAt(
            oracleAddress,
            oracle.currentPriceValiditySlotAndOffset.slot
        );
        const isPriceValid =
            parseInt(priceValiditySlotValue[oracle.currentPriceValiditySlotAndOffset.offset], 16) === 1;
        return isPriceValid
            ? new BigNumber(`0x${currentPriceFeed.substring(slotPriceValueBeginsAtPosition)}`).shiftedBy(
                  -DAI_NUMBER_OF_DIGITS
              )
            : new BigNumber(NaN);
    },
    CurrentAndNextPrice: async (
        oracle: OracleCurrentAndNextPrices,
        provider: ethers.providers.JsonRpcProvider,
        oracleAddress: string
    ) => {
        return await getOraclePriceSameSlotValidity(
            oracle.currentPriceSlotAddress,
            oracle.slotPriceValueBeginsAtPosition,
            provider,
            oracleAddress
        );
    },
    CappedWrapper: async (
        oracle: OracleCappedWrapper,
        provider: ethers.providers.JsonRpcProvider,
        oracleAddress: string
    ) => {
        const osmAddress = await getOracleWrapperOsmByAddress(oracleAddress, provider);
        return await currentPriceExtractors[oracle.oracle.type](oracle.oracle, provider, osmAddress);
    },
};

const getCurrentOraclePrice = async (
    oracle: CollateralPriceSourceConfig,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
) => {
    return currentPriceExtractors[oracle.type](oracle, provider, oracleAddress);
};

const calculateNextOraclePriceChange = async (
    hasDelay: boolean,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
) => {
    let nextPriceChange: Date = new Date(NaN);
    if (hasDelay) {
        const osmContractInterface = await getContractInterfaceByName('OSM');
        const osmContract = new ethers.Contract(oracleAddress, osmContractInterface, provider);
        const lastPriceUpdateAsHex = (await osmContract.zzz())._hex;
        const priceUpdateFrequencyInSeconds = await osmContract.hop();
        const lastPriceUpdateTimestampInSeconds = new BigNumber(lastPriceUpdateAsHex).toNumber();
        nextPriceChange = new Date((lastPriceUpdateTimestampInSeconds + priceUpdateFrequencyInSeconds) * 1000);
    }
    return nextPriceChange;
};

export const getNextOraclePriceChange = async (
    config: CollateralPriceSourceConfig,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
) => {
    if (config.type === 'CappedWrapper') {
        const hasDelay = config.oracle.hasDelay;
        if (!hasDelay) {
            return new Date(NaN);
        }

        const osmAddress = await getOracleWrapperOsmByAddress(oracleAddress, provider);
        return await calculateNextOraclePriceChange(hasDelay, provider, osmAddress);
    }
    return await calculateNextOraclePriceChange(config.hasDelay, provider, oracleAddress);
};

export const getCurrentOraclePriceByCollateralType = async function (network: string, collateralType: string) {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const provider = await getProvider(network);
    const oracleAddress = await getOracleAddressByCollateralType(network, collateralType);
    const oraclePrice = await getCurrentOraclePrice(collateralConfig.oracle, provider, oracleAddress);
    return oraclePrice;
};

const _getOsmPrices = async (
    network: string,
    oracleAddress: string,
    collateralType: CollateralType
): Promise<OraclePrices> => {
    const provider = await getProvider(network);
    const collateralConfig = getCollateralConfigByType(collateralType);

    const nextUnitCollateralPrice = await getNextOraclePrice(collateralConfig.oracle, provider, oracleAddress);
    const currentUnitCollateralPrice = await getCurrentOraclePrice(collateralConfig.oracle, provider, oracleAddress);
    const nextPriceChange = await getNextOraclePriceChange(collateralConfig.oracle, provider, oracleAddress);

    return {
        currentUnitPrice: currentUnitCollateralPrice,
        nextUnitPrice: nextUnitCollateralPrice,
        nextPriceChange,
    };
};

export const getOsmPrices = memoizee(_getOsmPrices, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 3,
});
