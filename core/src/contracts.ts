import type { Contract, ContractInterface } from 'ethers';
import BigNumber from '../src/bignumber';
import { RAD_NUMBER_OF_DIGITS, RAY_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from '../src/constants/UNITS';
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
import MCD_JUG from './abis/MCD_JUG.json';
import ERC20 from './abis/ERC20.json';
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
    const ABIs: Record<string, ContractInterface> = {
        MCD_DAI,
        MCD_VOW,
        MCD_VAT,
        MCD_DOG,
        MCD_FLAP,
        MCD_FLOP,
        WSTETH,
        MCD_JOIN_DAI,
        MCD_GOV,
        ETH: WETH,
        UNISWAP,
        CDP_MANAGER,
        OSM_MOM,
        OSM,
        MEDIAN_PRICE_FEED,
        MCD_SPOT,
        MCD_JUG,
    };
    if (Object.keys(ABIs).includes(contractName)) {
        return ABIs[contractName];
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
    throw new Error(`No contract interface found for "${contractName}"`);
};

const _getContract = async function (network: string, contractName: string, useSigner = false): Promise<Contract> {
    const contractAddress = await getContractAddressByName(network, contractName);
    const contractInterface = await getContractInterfaceByName(contractName);
    const signerOrProvider = useSigner ? await getSigner(network) : await getProvider(network);
    const contract = await new ethers.Contract(contractAddress, contractInterface, signerOrProvider);
    return contract;
};

export const getErc20Contract = async function (network: string, contractAddress: string, useSigner = false) {
    const signerOrProvider = useSigner ? await getSigner(network) : await getProvider(network);
    const contract = await new ethers.Contract(contractAddress, ERC20, signerOrProvider);
    return contract;
};

const getContract = memoizee(_getContract, {
    promise: true,
    length: 3,
});

export const getContractValue = async function (
    network: string,
    contractName: string,
    contractMethod: string,
    options: {
        parameters?: Array<any>;
        decimalUnits?: 'RAY' | 'RAD' | 'WAD';
        variableName?: string;
    }
) {
    const contract = await getContract(network, contractName);
    const valueHex = await contract[contractMethod](...(options.parameters ?? []));
    const variableHex = options.variableName ? valueHex[options.variableName] : valueHex;
    if (!options.decimalUnits) {
        return variableHex;
    }
    const decimals = {
        RAD: RAD_NUMBER_OF_DIGITS,
        RAY: RAY_NUMBER_OF_DIGITS,
        WAD: WAD_NUMBER_OF_DIGITS,
    }[options.decimalUnits];
    return new BigNumber(variableHex._hex).shiftedBy(-decimals);
};

export default getContract;
