import type { MakerParams } from './types';
import { ethers } from 'ethers';
import memoizee from 'memoizee';
import BigNumber from './bignumber';
import getProvider from './provider';
import MCD_CLIP_CALC from './abis/MCD_CLIP_CALC.json';
import { RAY_NUMBER_OF_DIGITS } from './constants/UNITS';
import { fetchContractsAddressesByNetwork, getSupportedCollateralTypes } from './addresses';

const PARAMS_CACHE = 24 * 60 * 60 * 1000;

const getCalcAddressByCollateralType = async function (network: string, collateralType: string): Promise<string> {
    const suffix = collateralType.replace('-', '_');
    const contracts = await fetchContractsAddressesByNetwork(network);
    const calcAddress = contracts[`MCD_CLIP_CALC_${suffix}`];

    if (!calcAddress) {
        throw new Error(`"${collateralType}" contract is not found on the "${network}" network`);
    }
    return calcAddress;
};

const _fetchCalcParametersByCollateralType = async function (
    network: string,
    collateralType: string
): Promise<MakerParams> {
    const address = await getCalcAddressByCollateralType(network, collateralType);
    const provider = await getProvider(network);
    const contract = await new ethers.Contract(address, MCD_CLIP_CALC, provider);

    const secondsBetweenPriceDrops = await contract.step();
    const cut = await contract.cut();
    const priceDropRatio = new BigNumber(cut.toString()).shiftedBy(-RAY_NUMBER_OF_DIGITS);

    return {
        secondsBetweenPriceDrops,
        priceDropRatio,
    };
};

export const fetchCalcParametersByCollateralType = memoizee(_fetchCalcParametersByCollateralType, {
    maxAge: PARAMS_CACHE,
    promise: true,
    length: 2,
});

export const checkAllCalcParameters = async function (network: string): Promise<void> {
    const errors = [];
    const successes = [];
    for (const collateral of await getSupportedCollateralTypes(network)) {
        try {
            const calcParameters = await fetchCalcParametersByCollateralType(network, collateral);
            successes.push(collateral);
            console.info(
                'getAllCacParameters:',
                collateral,
                calcParameters.secondsBetweenPriceDrops,
                new BigNumber(calcParameters.priceDropRatio).toNumber()
            );
        } catch (error) {
            errors.push(collateral);
            console.error('getAllCacParameters error', collateral, error);
        }
    }
    console.info('fetchCalcParameters finished, could not fetch collaterals:', errors, successes);
};
