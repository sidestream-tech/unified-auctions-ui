import getContract, { getContractInterfaceByName } from './contracts';
import getProvider from './provider';
import { VaultBase, CollateralType, VaultAmount, VaultCollateralParameters, Vault, OraclePrices, VaultTransactionBase } from './types';
import BigNumber from './bignumber';
import { ethers } from 'ethers';
import { RAD_NUMBER_OF_DIGITS, RAY_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from './constants/UNITS';

export const fetchVaultBase = async (network: string, id: number): Promise<VaultBase> => {
    const contract = await getContract(network, 'CDP_MANAGER');
    const address = await contract.urns(id);
    const collateralType = await contract.ilks(id);
    return {
        id,
        address,
        collateralType,
        lastSyncedAt: new Date(),
        network,
    };
};

export const fetchVaultsCount = async (network: string): Promise<BigNumber> => {
    const contract = await getContract(network, 'CDP_MANAGER');
    const countHex = contract.count();
    return new BigNumber(countHex._hex);
};

export const fetchVaultCollateralParameters = async (
    network: string,
    type: CollateralType
): Promise<VaultCollateralParameters> => {
    const contract = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(type);
    const { rate, spot } = await contract.ilks(typeHex);
    return {
        stabilityFeeRate: rate,
        minUnitPrice: spot,
    };
};

export const fetchVaultAmount = async (
    network: string,
    type: CollateralType,
    vaultAddress: string
): Promise<VaultAmount> => {
    const contract = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(type);
    const { ink, art } = await contract.urns(typeHex, vaultAddress);
    return {
        initialDebtDai: art,
        collateralAmount: ink,
    };
};

export const fetchGlobalLiquidationLimits = async (network: string) => {
    const contract = await getContract(network, 'MCD_DOG');
    const maximumProtocolDebtDaiHex = await contract.Hole();
    const maximumProtocolDebtDai = new BigNumber(maximumProtocolDebtDaiHex._hex);
    const currentProtocolDebtDaiHex = await contract.Hole();
    const currentProtocolDebtDai = new BigNumber(currentProtocolDebtDaiHex._hex);
    return {
        currentProtocolDebtDai,
        maximumProtocolDebtDai,
    };
};

export const fetchCollateralLiquidationLimitsAndLiquidatorAddress = async (network: string, type: string) => {
    const contract = await getContract(network, 'MCD_DOG');
    const typeHex = ethers.utils.formatBytes32String(type);
    const { hole, dirt, clip } = await contract.ilks(typeHex);
    return { currentCollateralDebtDai: dirt, maximumCollateralDebtDai: hole, liquidatiorContractAddress: clip };
};

export const fetchVault = async (network: string, index: number): Promise<Vault> => {
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

export const getOsmPrices = async (network: string, type: CollateralType): Promise<OraclePrices> => {
    const contract = await getContract(network, 'OSM_MOM');
    const typeHex = ethers.utils.formatBytes32String(type);
    const provider = await getProvider(network);

    const osmAddress = await contract.osms(typeHex);
    const osmContractInterface = await getContractInterfaceByName('OSM');
    const osmContract = new ethers.Contract(osmAddress, osmContractInterface, provider);
    const osmEventFilter = osmContract.filters.LogValue(null);
    const osmEvents = await osmContract.queryFilter(osmEventFilter, -1000);
    const currentUnitCollateralPrice = new BigNumber(osmEvents[osmEvents.length - 1].args?.val);
    const lastPriceUpdateAsHex = await osmContract.zzz();
    const lastPriceUpdateTimestampInSeconds = new BigNumber(lastPriceUpdateAsHex._hex).toNumber();
    const priceUpdateFrequencyInSeconds = await osmContract.hop();

    const priceFeedContractAddress = await osmContract.src();
    const priceFeedContractInterface = await getContractInterfaceByName('MEDIAN');
    const priceFeedContract = new ethers.Contract(priceFeedContractAddress, priceFeedContractInterface, provider);
    const feedEventsFilter = priceFeedContract.filters.LogMedianPrice(null, null);
    const feedEvents = await priceFeedContract.queryFilter(feedEventsFilter, -1000);
    const nextUnitCollateralPrice = new BigNumber(feedEvents[feedEvents.length - 1].args?.val._hex);

    return {
        currentUnitPrice: currentUnitCollateralPrice,
        nextUnitPrice: nextUnitCollateralPrice,
        nextPriceChange: new Date((lastPriceUpdateTimestampInSeconds + priceUpdateFrequencyInSeconds) * 1000),
    };
};

export const fetchLiquidationRatio = async (network: string, collateralType: CollateralType): Promise<number> => {
    const contract = await getContract(network, 'MCD_SPOT');
    const collateralTypeAsHex = ethers.utils.formatBytes32String(collateralType);
    const liquidationRatioAsHex = (await contract.ilks(collateralTypeAsHex)).mat;
    return new BigNumber(liquidationRatioAsHex._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS).toNumber();
};

export const fetchVaultTransactonBase = async (network: string, vault: Vault): Promise<VaultTransactionBase> => {
    const debtDai = vault.initialDebtDai.multipliedBy(vault.stabilityFeeRate);
    const { liquidatiorContractAddress } = await fetchCollateralLiquidationLimitsAndLiquidatorAddress(
        network,
        vault.collateralType
    );
    const liquidatorContractInterface = await getContractInterfaceByName('MCD_CLIP_' + vault.collateralType);
    const provider = await getProvider(network);
    const liquidatorContract = new ethers.Contract(liquidatiorContractAddress, liquidatorContractInterface, provider);
    const incentiveConstantDaiHex = await liquidatorContract.tip();
    const incentiveRelativeDaiHex = await liquidatorContract.chip();
    const incentiveRelativeDai = new BigNumber(incentiveRelativeDaiHex._hex)
        .shiftedBy(-WAD_NUMBER_OF_DIGITS)
        .multipliedBy(debtDai);
    const incentiveConstantDai = new BigNumber(incentiveConstantDaiHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const incentiveCombinedDai = incentiveRelativeDai.plus(incentiveConstantDai);

    const liquidationRatio = await fetchLiquidationRatio(network, vault.collateralType);
    const collateralizationRatio = vault.collateralAmount
        .multipliedBy(vault.minUnitPrice)
        .multipliedBy(liquidationRatio)
        .dividedBy(debtDai)
        .toNumber();
    const proximityToLiquidation = liquidationRatio - collateralizationRatio;
    // TODO: add real fees
    const transactionFeeLiquidationDai = new BigNumber(0)
    const transactionFeeLiquidationEth = new BigNumber(0)
    const {nextUnitPrice, nextPriceChange, currentUnitPrice} = await getOsmPrices(network, vault.collateralType);
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
        transactionFeeLiquidationEth
    }
};

