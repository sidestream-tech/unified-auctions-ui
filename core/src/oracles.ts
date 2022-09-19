import { getContractInterfaceByName } from './contracts';
import getProvider from './provider';
import {
    CollateralConfig,
    CollateralPriceSourceConfig,
    OraclePrices,
    OracleCurrentPriceOnly,
    OracleCurrentAndNextPrices,
    CollateralType,
} from './types';
import BigNumber from './bignumber';
import { ethers } from 'ethers';
import { WAD_NUMBER_OF_DIGITS } from './constants/UNITS';
import memoizee from 'memoizee';
import COLLATERALS from './constants/COLLATERALS';

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

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
        return new BigNumber(`0x${priceAndValidityHex.substring(slotPriceValueBeginsAtPosition)}`);
    }
    return new BigNumber(NaN);
};

const getNextOraclePrice = async (
    oracle: CollateralPriceSourceConfig,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
): Promise<BigNumber> => {
    // Determine if the next price can be fetched from the contract.
    if (oracle.type !== 'CurrentAndNextPrice') {
        return new BigNumber(NaN);
    }
    return await getOraclePriceSameSlotValidity(
        oracle.nextPriceSlotAddress,
        oracle.slotPriceValueBeginsAtPosition,
        provider,
        oracleAddress
    );
};

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
        const priceValiditySlotValue = await provider.getStorageAt(oracleAddress, oracle.currentPriceValiditySlotAndOffset.slot);
        const isPriceValid = parseInt(priceValiditySlotValue[oracle.currentPriceValiditySlotAndOffset.offset], 16) === 1;
        return isPriceValid
            ? new BigNumber(`0x${currentPriceFeed.substring(slotPriceValueBeginsAtPosition)}`)
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
};
const getCurrentOraclePrice = async (
    oracle: CollateralPriceSourceConfig,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
) => {
    return currentPriceExtractors[oracle.type](oracle, provider, oracleAddress);
};

const getNextOraclePriceChange = async (
    collateralConfig: CollateralConfig,
    provider: ethers.providers.JsonRpcProvider,
    oracleAddress: string
) => {
    let nextPriceChange: Date = new Date(NaN);
    if (collateralConfig.oracle.hasDelay) {
        const osmContractInterface = await getContractInterfaceByName('OSM');
        const osmContract = new ethers.Contract(oracleAddress, osmContractInterface, provider);
        const lastPriceUpdateAsHex = (await osmContract.zzz())._hex;
        const priceUpdateFrequencyInSeconds = await osmContract.hop();
        const lastPriceUpdateTimestampInSeconds = new BigNumber(lastPriceUpdateAsHex).toNumber();
        nextPriceChange = new Date((lastPriceUpdateTimestampInSeconds + priceUpdateFrequencyInSeconds) * 1000);
    }
    return nextPriceChange;
};

const _getOsmPrices = async (
    network: string,
    oracleAddress: string,
    collateralType: CollateralType
): Promise<OraclePrices> => {
    const provider = await getProvider(network);
    const collateralConfig = COLLATERALS[collateralType];

    const nextPrice = await getNextOraclePrice(collateralConfig.oracle, provider, oracleAddress);
    const currentPrice = await getCurrentOraclePrice(collateralConfig.oracle, provider, oracleAddress);
    const nextPriceChange = await getNextOraclePriceChange(collateralConfig, provider, oracleAddress);

    const currentUnitCollateralPrice = new BigNumber(currentPrice).shiftedBy(-WAD_NUMBER_OF_DIGITS);
    const nextUnitCollateralPrice = new BigNumber(nextPrice).shiftedBy(-WAD_NUMBER_OF_DIGITS);

    return {
        currentUnitPrice: currentUnitCollateralPrice,
        nextUnitPrice: nextUnitCollateralPrice || new BigNumber(NaN),
        nextPriceChange,
    };
};

export const getOsmPrices = memoizee(_getOsmPrices, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 3,
});
