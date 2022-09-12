import getContract, { getContractInterfaceByName } from './contracts';
import getProvider from './provider';
import {
    VaultBase,
    CollateralType,
    VaultAmount,
    VaultCollateralParameters,
    Vault,
    OraclePrices,
    VaultTransactionNotLiquidated,
    VaultTransaction,
} from './types';
import BigNumber from './bignumber';
import { ethers } from 'ethers';
import {
    DAI_NUMBER_OF_DIGITS,
    RAD_NUMBER_OF_DIGITS,
    RAY_NUMBER_OF_DIGITS,
    WAD_NUMBER_OF_DIGITS,
} from './constants/UNITS';
import { getApproximateLiquidationFees } from './fees';
import { fetchDateByBlockNumber } from './date';
import memoizee from 'memoizee';
import { getMarketPrice } from './calleeFunctions';
import { getCollateralConfigByType } from './constants/COLLATERALS';

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const _fetchVaultBase = async (network: string, id: number): Promise<VaultBase> => {
    const contract = await getContract(network, 'CDP_MANAGER');
    const address = await contract.urns(id);
    const collateralTypeHex = await contract.ilks(id);
    const collateralType = ethers.utils.parseBytes32String(collateralTypeHex);
    return {
        id,
        address,
        collateralType,
        lastSyncedAt: new Date(),
        network,
    };
};

export const fetchVaultBase = memoizee(_fetchVaultBase, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const _fetchVaultsCount = async (network: string): Promise<BigNumber> => {
    const contract = await getContract(network, 'CDP_MANAGER');
    const countHex = contract.count();
    return new BigNumber(countHex._hex);
};

export const fetchVaultsCount = memoizee(_fetchVaultsCount, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 1,
});

const _fetchVaultCollateralParameters = async (
    network: string,
    type: CollateralType
): Promise<VaultCollateralParameters> => {
    const contract = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(type);
    const { rate, spot } = await contract.ilks(typeHex);
    return {
        stabilityFeeRate: new BigNumber(rate._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS),
        minUnitPrice: new BigNumber(spot._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS),
    };
};

export const fetchVaultCollateralParameters = memoizee(_fetchVaultCollateralParameters, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const _fetchVaultAmount = async (
    network: string,
    type: CollateralType,
    vaultAddress: string
): Promise<VaultAmount> => {
    const contract = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(type);
    const { ink, art } = await contract.urns(typeHex, vaultAddress);
    return {
        initialDebtDai: new BigNumber(art._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS),
        collateralAmount: new BigNumber(ink._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS),
    };
};

export const fetchVaultAmount = memoizee(_fetchVaultAmount, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 3,
});

const _fetchGlobalLiquidationLimits = async (network: string) => {
    const contract = await getContract(network, 'MCD_DOG');
    const maximumProtocolDebtDaiHex = await contract.Hole();
    const maximumProtocolDebtDai = new BigNumber(maximumProtocolDebtDaiHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const currentProtocolDebtDaiHex = await contract.Dirt();
    const currentProtocolDebtDai = new BigNumber(currentProtocolDebtDaiHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    return {
        currentProtocolDebtDai,
        maximumProtocolDebtDai,
    };
};

export const fetchGlobalLiquidationLimits = memoizee(_fetchGlobalLiquidationLimits, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 1,
});

const _fetchCollateralLiquidationLimitsAndLiquidatorAddress = async (network: string, type: string) => {
    const contract = await getContract(network, 'MCD_DOG');
    const typeHex = ethers.utils.formatBytes32String(type);
    const { hole, dirt, clip } = await contract.ilks(typeHex);
    return {
        currentCollateralDebtDai: new BigNumber(dirt._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS),
        maximumCollateralDebtDai: new BigNumber(hole._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS),
        liquidatiorContractAddress: clip,
    };
};

export const fetchCollateralLiquidationLimitsAndLiquidatorAddress = memoizee(
    _fetchCollateralLiquidationLimitsAndLiquidatorAddress,
    {
        maxAge: CACHE_EXPIRY_MS,
        promise: true,
        length: 2,
    }
);

const _fetchVault = async (network: string, index: number): Promise<Vault> => {
    const vaultBase = await fetchVaultBase(network, index);
    const vaultCollateralParameters = await fetchVaultCollateralParameters(network, vaultBase.collateralType);
    const vaultAmount = await fetchVaultAmount(network, vaultBase.collateralType, vaultBase.address);
    const globalLiquidationLimits = await fetchGlobalLiquidationLimits(network);
    const { currentCollateralDebtDai, maximumCollateralDebtDai } =
        await fetchCollateralLiquidationLimitsAndLiquidatorAddress(network, vaultBase.collateralType);
    return {
        ...vaultBase,
        ...vaultCollateralParameters,
        ...vaultAmount,
        ...globalLiquidationLimits,
        currentCollateralDebtDai,
        maximumCollateralDebtDai,
    };
};
export const fetchVault = memoizee(_fetchVault, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const isListEmpty = (list: Array<any>) => {
    if (list.length === 0) {
        return true;
    }
    return false;
};

const _getOsmPrices = async (
    network: string,
    type: CollateralType,
    amountLatestBlocksToFetchEventFrom: number = 100000
): Promise<OraclePrices> => {
    const contract = await getContract(network, 'OSM_MOM');
    const typeHex = ethers.utils.formatBytes32String(type);
    const provider = await getProvider(network);

    const osmAddress = await contract.osms(typeHex);
    const osmContractInterface = await getContractInterfaceByName('OSM');
    const osmContract = new ethers.Contract(osmAddress, osmContractInterface, provider);
    const osmEventFilter = osmContract.filters.LogValue(null);
    const osmEvents = await osmContract.queryFilter(osmEventFilter, -amountLatestBlocksToFetchEventFrom);
    if (isListEmpty(osmEvents)) {
        return {
            currentUnitPrice: await getMarketPrice(network, getCollateralConfigByType(type).symbol),
            nextUnitPrice: undefined,
            nextPriceChange: undefined,
        };
    }
    const currentUnitCollateralPrice = new BigNumber(osmEvents[osmEvents.length - 1].args?.val).shiftedBy(-WAD_NUMBER_OF_DIGITS);
    const lastPriceUpdateAsHex = await osmContract.zzz();
    const lastPriceUpdateTimestampInSeconds = new BigNumber(lastPriceUpdateAsHex._hex).toNumber();
    const priceUpdateFrequencyInSeconds = await osmContract.hop();

    const priceFeedContractAddress = await osmContract.src();
    const priceFeedContractInterface = await getContractInterfaceByName('MEDIAN_PRICE_FEED');
    const priceFeedContract = new ethers.Contract(priceFeedContractAddress, priceFeedContractInterface, provider);
    const feedEventsFilter = priceFeedContract.filters.LogMedianPrice(null, null);
    const feedEvents = await priceFeedContract.queryFilter(feedEventsFilter, -amountLatestBlocksToFetchEventFrom);
    if (isListEmpty(feedEvents)) {
        return {
            currentUnitPrice: await getMarketPrice(network, getCollateralConfigByType(type).symbol),
            nextUnitPrice: undefined,
            nextPriceChange: undefined,
        };
    }
    const nextUnitCollateralPrice = new BigNumber(feedEvents[feedEvents.length - 1].args?.val._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS);

    return {
        currentUnitPrice: currentUnitCollateralPrice,
        nextUnitPrice: nextUnitCollateralPrice,
        nextPriceChange: new Date((lastPriceUpdateTimestampInSeconds + priceUpdateFrequencyInSeconds) * 1000),
    };
};

export const getOsmPrices = memoizee(_getOsmPrices, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 3,
});

const _fetchLiquidationRatio = async (network: string, collateralType: CollateralType): Promise<number> => {
    const contract = await getContract(network, 'MCD_SPOT');
    const collateralTypeAsHex = ethers.utils.formatBytes32String(collateralType);
    const liquidationRatioAsHex = (await contract.ilks(collateralTypeAsHex)).mat;
    return new BigNumber(liquidationRatioAsHex._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS).toNumber();
};

export const fetchLiquidationRatio = memoizee(_fetchLiquidationRatio, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const _fetchVaultLiquidationIncentive = async (
    network: string,
    liquidatiorContractAddress: string,
    debtDai: BigNumber
) => {
    const liquidatorContractInterface = await getContractInterfaceByName('MCD_CLIP_');
    const provider = await getProvider(network);
    const liquidatorContract = new ethers.Contract(liquidatiorContractAddress, liquidatorContractInterface, provider);
    const incentiveConstantDaiHex = await liquidatorContract.tip();
    const incentiveRelativeDaiHex = await liquidatorContract.chip();
    const incentiveRelativeDai = new BigNumber(incentiveRelativeDaiHex._hex)
        .shiftedBy(-WAD_NUMBER_OF_DIGITS)
        .multipliedBy(debtDai);
    const incentiveConstantDai = new BigNumber(incentiveConstantDaiHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const incentiveCombinedDai = incentiveRelativeDai.plus(incentiveConstantDai);
    return {
        incentiveCombinedDai,
        incentiveConstantDai,
        incentiveRelativeDai,
    };
};

export const fetchVaultLiquidationIncentive = memoizee(_fetchVaultLiquidationIncentive, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 3,
});

const _isVaultLiquidated = async (network: string, vault: Vault) => {
    const contract = await getContract(network, 'MCD_DOG');
    const typeHex = ethers.utils.formatBytes32String(vault.collateralType);
    const eventFilter = contract.filters.Bark(typeHex, vault.address, null, null, null, null, null);
    const liquidationEvents = await contract.queryFilter(eventFilter);
    if (liquidationEvents.length !== 0 && vault.initialDebtDai.eq(0)) {
        // there was a liquidation and the vault was not used again
        const latestEvent = liquidationEvents[liquidationEvents.length - 1];
        return {
            isLiquidated: true,
            liquidationDate: await fetchDateByBlockNumber(network, latestEvent.blockNumber),
            transactionHash: latestEvent.transactionHash,
            auctionId: new BigNumber(latestEvent.args?.id._hex).toFixed(),
        };
    }
    return { isLiquidated: false };
};
export const isVaultLiquidated = memoizee(_isVaultLiquidated, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const _enrichVaultWithTransactonInformation = async (
    network: string,
    vault: Vault
): Promise<VaultTransactionNotLiquidated> => {
    const debtDai = vault.initialDebtDai.multipliedBy(vault.stabilityFeeRate);
    const { liquidatiorContractAddress } = await fetchCollateralLiquidationLimitsAndLiquidatorAddress(
        network,
        vault.collateralType
    );
    const { incentiveCombinedDai, incentiveConstantDai, incentiveRelativeDai } = await fetchVaultLiquidationIncentive(
        network,
        liquidatiorContractAddress,
        debtDai
    );

    const liquidationRatio = await fetchLiquidationRatio(network, vault.collateralType);
    const collateralizationRatio = vault.collateralAmount
        .multipliedBy(vault.minUnitPrice)
        .multipliedBy(liquidationRatio)
        .dividedBy(debtDai)
        .toNumber();
    const proximityToLiquidation = collateralizationRatio - liquidationRatio;
    const { transactionFeeLiquidationEth, transactionFeeLiquidationDai } = await getApproximateLiquidationFees(
        network
    );
    const { nextUnitPrice, nextPriceChange, currentUnitPrice } = await getOsmPrices(network, vault.collateralType);
    const state = proximityToLiquidation < 0 ? 'liquidatable' : 'not-liquidatable';
    return {
        ...vault,
        liquidationRatio,
        collateralizationRatio,
        proximityToLiquidation,
        incentiveConstantDai,
        incentiveCombinedDai,
        incentiveRelativeDai,
        grossProfitDai: incentiveCombinedDai,
        netProfitDai: incentiveCombinedDai.minus(transactionFeeLiquidationDai),
        transactionFeeLiquidationDai,
        debtDai,
        nextUnitPrice,
        nextPriceChange,
        currentUnitPrice,
        transactionFeeLiquidationEth,
        state,
    };
};

export const enrichVaultWithTransactonInformation = memoizee(_enrichVaultWithTransactonInformation, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const _getVaultTransaction = async (network: string, vault: Vault): Promise<VaultTransaction> => {
    const { isLiquidated, liquidationDate, transactionHash, auctionId } = await isVaultLiquidated(network, vault);
    if (isLiquidated) {
        return {
            ...vault,
            state: 'liquidated',
            liquidationDate: liquidationDate as Date,
            transactionHash: transactionHash as string,
            auctionId: auctionId as string,
        };
    }
    return await enrichVaultWithTransactonInformation(network, vault);
};

export const getVaultTransaction = memoizee(_getVaultTransaction, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});
