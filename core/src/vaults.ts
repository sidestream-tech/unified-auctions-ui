import getContract from './contracts';
import { VaultBase, CollateralType } from './types';
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

export const fetchVatVault = async (network: string, type: CollateralType, vaultAddress: string) => {
    const contract = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(type);
    const {ink, art} = await contract.urns(typeHex, vaultAddress);
    const {Art, rate, spot, line, dust} = await contract.ilks(typeHex);
    console.log(ink, art, Art, rate, spot, line, dust);
};
