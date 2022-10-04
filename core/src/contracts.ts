import type { Contract, ContractInterface } from 'ethers';
import { ethers } from 'ethers';
import getProvider from './provider';
import { fetchContractAddressByNetwork } from './addresses';
import MCD_DAI from './abis/MCD_DAI.json';
import MCD_VAT from './abis/MCD_VAT.json';
import MCD_JOIN_DAI from './abis/MCD_JOIN_DAI.json';
import MCD_JOIN from './abis/MCD_JOIN.json';
import MCD_CLIP_CALC from './abis/MCD_CLIP_CALC.json';
import MCD_CLIP from './abis/MCD_CLIP.json';
import MCD_DOG from './abis/MCD_DOG.json';
import MCD_FLAP from './abis/MCD_FLAP.json';
import MCD_FLOP from './abis/MCD_FLOP.json';
import MCD_GOV from './abis/MCD_GOV.json';
import WSTETH from './abis/WSTETH.json';
import WETH from './abis/WETH.json';
import UNISWAP from './abis/UNISWAP_V2_ROUTER_02.json';
import MCD_VOW from './abis/MCD_VOW.json';
import CDP_MANAGER from './abis/CDP_MANAGER.json';
import OSM_MOM from './abis/OSM_MOM.json';
import OSM from './abis/OSM.json';
import MEDIAN_PRICE_FEED from './abis/MEDIAN_PRICE_FEED.json';
import MCD_SPOT from './abis/MCD_SPOT.json';
import getSigner from './signer';
import memoizee from 'memoizee';

export const getClipperNameByCollateralType = function (collateralType: string): string {
    const suffix = collateralType.toUpperCase().replace('-', '_');
    return `MCD_CLIP_${suffix}`;
};

export const getJoinNameByCollateralType = function (collateralType: string): string {
    const suffix = collateralType.toUpperCase().replace('-', '_');
    return `MCD_JOIN_${suffix}`;
};

export const getContractAddressByName = async function (network: string, contractName: string): Promise<string> {
    return await fetchContractAddressByNetwork(network, contractName);
};

export const getContractInterfaceByName = async function (contractName: string): Promise<ContractInterface> {
    if (contractName === 'MCD_DAI') {
        return MCD_DAI;
    }
    if (contractName === 'MCD_VOW') {
        return MCD_VOW;
    }
    if (contractName === 'MCD_VAT') {
        return MCD_VAT;
    }
    if (contractName === 'MCD_DOG') {
        return MCD_DOG;
    }
    if (contractName === 'MCD_FLAP') {
        return MCD_FLAP;
    }
    if (contractName === 'MCD_FLOP') {
        return MCD_FLOP;
    }
    if (contractName === 'WSTETH') {
        return WSTETH;
    }
    if (contractName === 'MCD_JOIN_DAI') {
        return MCD_JOIN_DAI;
    }
    if (contractName.startsWith('MCD_JOIN_')) {
        return MCD_JOIN;
    }
    if (contractName.startsWith('MCD_CLIP_CALC_')) {
        return MCD_CLIP_CALC;
    }
    if (contractName.startsWith('MCD_CLIP_')) {
        return MCD_CLIP;
    }
    if (contractName === 'MCD_GOV') {
        return MCD_GOV;
    }
    if (contractName === 'ETH') {
        return WETH;
    }
    if (contractName === 'UNISWAP') {
        return UNISWAP;
    }
    if (contractName === 'CDP_MANAGER') {
        return CDP_MANAGER;
    }
    if (contractName === 'OSM_MOM') {
        return OSM_MOM;
    }
    if (contractName === 'OSM') {
        return OSM;
    }
    if (contractName === 'MEDIAN_PRICE_FEED') {
        return MEDIAN_PRICE_FEED;
    }
    if (contractName === 'MCD_SPOT') {
        return MCD_SPOT;
    }
    throw new Error(`No contract interface found for "${contractName}"`);
};

const _getContract = async function (network: string, contractName: string, useSigner = false): Promise<Contract> {
    const contractAddress = await getContractAddressByName(network, contractName);
    const contractInterface = await getContractInterfaceByName(contractName);
    const signerOrProvider = useSigner ? await getSigner(network) : await getProvider(network);
    const contract = await new ethers.Contract(contractAddress, contractInterface, signerOrProvider);
    return contract;
};

const getContract = memoizee(_getContract, {
    promise: true,
    length: 3,
});

export default getContract;
