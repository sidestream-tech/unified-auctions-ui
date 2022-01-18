import getProvider from './provider';
import { ethers } from 'ethers';
import CHAINLOG from './abis/CHAINLOG.json';
import { CHAINLOG_ADDRESS } from './constants/NETWORKS';
import memoizee from 'memoizee';
import COLLATERALS, { getAllCollateralTypes } from './constants/COLLATERALS';

const CHAINLOG_CACHE = 24 * 60 * 60 * 1000;

const _fetchContractsAddressesByNetwork = async function (
    network: string
): Promise<Record<string, string | undefined>> {
    const provider = getProvider(network);
    const contract = await new ethers.Contract(CHAINLOG_ADDRESS, CHAINLOG, provider);

    const contractNames: string[] = await contract.list();
    const contracts: Record<string, string | undefined> = {};

    await Promise.all(
        contractNames.map(async contractName => {
            const key = ethers.utils.parseBytes32String(contractName);
            contracts[key] = await contract.getAddress(contractName);
        })
    );
    return contracts;
};

export const fetchContractsAddressesByNetwork = memoizee(_fetchContractsAddressesByNetwork, {
    maxAge: CHAINLOG_CACHE,
    promise: true,
    length: 1,
});

export const isCollateralSupported = async function (network: string, collateral: string): Promise<boolean> {
    const contracts = await fetchContractsAddressesByNetwork(network);
    return !!contracts[collateral];
};

export const getSupportedCollateralTypes = async function (network: string): Promise<string[]> {
    const allCollateralTypes = getAllCollateralTypes();
    const contracts = await fetchContractsAddressesByNetwork(network);

    return await Promise.all(
        allCollateralTypes.filter(collateralType => {
            return !!contracts[COLLATERALS[collateralType].symbol];
        })
    );
};

export const checkAllSupportedCollaterals = async function (network: string): Promise<void> {
    const errors = [];
    const successes = [];
    for (const collateral of getAllCollateralTypes()) {
        const isSupported = await isCollateralSupported(network, COLLATERALS[collateral].symbol);

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
