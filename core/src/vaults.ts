import getContract from './contracts';
import { VaultBase, CollateralType, VaultAmount, VaultCollateralParameters } from './types';
import BigNumber from './bignumber';
import { ethers } from 'ethers';

export const fetchCdpVault = async (network: string, id: number): Promise<VaultBase> => {
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
