import type { Contract, ContractInterface } from 'ethers';
import { ethers } from 'ethers';
import getProvider from './provider';
import { fetchContractsAddressesByNetwork } from './addresses';
import MCD_VAT from './abis/MCD_VAT.json';
import MCD_JOIN_DAI from './abis/MCD_JOIN_DAI.json';
import MCD_CLIP_CALC from './abis/MCD_CLIP_CALC.json';
import MCD_CLIP from './abis/MCD_CLIP.json';

export const getContractAddressByName = async function (network: string, contractName: string): Promise<string> {
    const contractAddresses = await fetchContractsAddressesByNetwork(network);
    const contractAddress = contractAddresses[contractName];
    if (!contractAddress) {
        throw new Error(`No contract address found for "${contractName}"`);
    }
    return contractAddress;
};

export const getClipperAddressByCollateralType = async function (
    network: string,
    collateralType: string
): Promise<string> {
    const suffix = collateralType.replace('-', '_');
    return getContractAddressByName(network, `MCD_CLIP_${suffix}`);
};

const getContractInterfaceByName = async function (contractName: string): Promise<ContractInterface> {
    if (contractName === 'MCD_VAT') {
        return MCD_VAT;
    }
    if (contractName === 'MCD_JOIN_DAI') {
        return MCD_JOIN_DAI;
    }
    if (contractName.startsWith('MCD_CLIP_CALC_')) {
        return MCD_CLIP_CALC;
    }
    if (contractName.startsWith('MCD_CLIP_')) {
        return MCD_CLIP;
    }
    throw new Error(`No contract interface found for "${contractName}"`);
};

const getContract = async function (network: string, contractName: string): Promise<Contract> {
    const contractAddress = await getContractAddressByName(network, contractName);
    const contractInterface = await getContractInterfaceByName(contractName);
    const provider = getProvider(network);
    const contract = await new ethers.Contract(contractAddress, contractInterface, provider);
    return contract;
};

export default getContract;
