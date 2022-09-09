import getContract, { getContractInterfaceByName } from './contracts';
import getProvider from './provider';
import { VaultBase, CollateralType, VaultAmount, VaultCollateralParameters, Vault, OraclePrices } from './types';
import BigNumber from './bignumber';
import { ethers } from 'ethers';

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

export const fetchCollateralLiquidationLimits = async (network: string, type: string) => {
    const contract = await getContract(network, 'MCD_DOG');
    const typeHex = ethers.utils.formatBytes32String(type);
    const { hole, dirt } = await contract.ilks(typeHex);
    return { currentCollateralDebtDai: dirt, maximumCollateralDebtDai: hole };
};

export const fetchVault = async (network: string, index: number): Promise<Vault> => {
    const vaultBase = await fetchVaultBase(network, index);
    const vaultCollateralParameters = await fetchVaultCollateralParameters(network, vaultBase.collateralType);
    const vaultAmount = await fetchVaultAmount(network, vaultBase.collateralType, vaultBase.address);
    const globalLiquidationLimits = await fetchGlobalLiquidationLimits(network);
    const collateralLiquidationLimits = await fetchCollateralLiquidationLimits(network, vaultBase.collateralType);
    return {
        ...vaultBase,
        ...vaultCollateralParameters,
        ...vaultAmount,
        ...globalLiquidationLimits,
        ...collateralLiquidationLimits,
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
    const lastPriceUpdateTimestampInSeconds = new BigNumber(lastPriceUpdateAsHex._hex).toNumber()
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
