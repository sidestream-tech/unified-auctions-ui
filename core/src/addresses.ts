import type { Contract } from 'ethers';
import { ethers } from 'ethers';
import memoizee from 'memoizee';
import COLLATERALS, { getAllCollateralTypes } from './constants/COLLATERALS';
import getProvider from './provider';
import CHAINLOG from './abis/CHAINLOG.json';
import { CHAINLOG_ADDRESS } from './constants/NETWORKS';

const CHAINLOG_CACHE = 24 * 60 * 60 * 1000;

const getChainLogContract = async function (network: string): Promise<Contract> {
    const provider = await getProvider(network);
    return await new ethers.Contract(CHAINLOG_ADDRESS, CHAINLOG, provider);
};

export const fetchContractsNamesByNetwork = async function (network: string): Promise<string[]> {
    const contract = await getChainLogContract(network);
    const encodedContractNames: string[] = await contract.list();
    return encodedContractNames.map(ethers.utils.parseBytes32String);
};

export const _fetchContractAddressByNetwork = async function (network: string, contractName: string): Promise<string> {
    const chainLogContract = await getChainLogContract(network);
    try {
        const encodedContractName = ethers.utils.formatBytes32String(contractName);
        return await chainLogContract.getAddress(encodedContractName);
    } catch (error) {
        throw new Error(`No contract address found for "${contractName}"`);
    }
};

export const fetchContractAddressByNetwork = memoizee(_fetchContractAddressByNetwork, {
    maxAge: CHAINLOG_CACHE,
    promise: true,
    length: 2,
});

export const isCollateralSymbolSupported = async function (
    network: string,
    collateralSymbol: string
): Promise<boolean> {
    const collateralAddress = await fetchContractAddressByNetwork(network, collateralSymbol);
    return !!collateralAddress;
};

export const isCollateralTypeSupported = async function (network: string, collateralType: string): Promise<boolean> {
    const suffix = collateralType.toUpperCase().replace('-', '_');
    const clipContractName = `MCD_CLIP_${suffix}`;
    const collateralAddress = await fetchContractAddressByNetwork(network, clipContractName);
    return !!collateralAddress;
};

export const getSupportedCollateralTypes = async function (network: string): Promise<string[]> {
    const allCollateralTypes = getAllCollateralTypes();
    const supportedCollateralsPromises = allCollateralTypes.map(async collateralType => {
        if (await isCollateralTypeSupported(network, collateralType)) {
            return collateralType;
        }
    });
    const supportedCollaterals = await Promise.all(supportedCollateralsPromises);
    return supportedCollaterals.filter((collateralType): collateralType is string => !!collateralType);
};

export const checkAllSupportedCollaterals = async function (network: string): Promise<void> {
    const errors = [];
    const successes = [];
    for (const collateral of getAllCollateralTypes()) {
        const isSupported = await isCollateralSymbolSupported(network, COLLATERALS[collateral].symbol);

        if (isSupported) {
            successes.push(collateral);
            console.info(`${collateral} is supported on the network: ${network}`);
        } else {
            errors.push(collateral);
            console.error(`${collateral} is NOT supported on the network: ${network}`);
        }
    }
    console.info('checkAllSupportedCollaterals finished, not supported collaterals:', errors, successes);
};
