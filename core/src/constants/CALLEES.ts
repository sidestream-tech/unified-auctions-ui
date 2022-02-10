import type { CalleeAddresses } from '../types';
import { getCollateralConfigByType } from './COLLATERALS';
import { getNetworkConfigByType } from './NETWORKS';

const CALLEES: Record<string, CalleeAddresses | undefined> = {
    '0x1': {
        UniswapV2CalleeDai: '0x49399BB0Fcb52b32aB5A0909206BFf7B54FF80b3',
        UniswapV2LpTokenCalleeDai: '0x74893C37beACf205507ea794470b13DE06294220',
    },
    '0x5': {
        UniswapV2CalleeDai: '0x6d9139ac89ad2263f138633de20e47bcae253938',
        UniswapV2LpTokenCalleeDai: '0x13eba3f2dd908e3624e9fb721ea9bd2f5d46f2c0',
    },
    '0x2a': {
        UniswapV2CalleeDai: '0x5A40F810754f725DA93e2362775a0600468f7a83',
        UniswapV2LpTokenCalleeDai: '0xDeC8b9c2829583A89f7F182DEeD7C12112dfAeD0',
    },
};

export const getCalleesByNetworkType = function (network: string): CalleeAddresses {
    const networkConfig = getNetworkConfigByType(network);
    const chainId = network === 'localhost' ? '0x1' : networkConfig.chainId;
    const networkCallees = CALLEES[chainId];
    if (!networkCallees) {
        throw new Error(`Can not find callee addresses for the "${network}" network`);
    }
    return networkCallees;
};

export const getCalleeAddressByCollateralType = function (network: string, collateralType: string): string {
    const networkCallees = getCalleesByNetworkType(network);
    const collateral = getCollateralConfigByType(collateralType);
    return networkCallees[collateral.exchange.callee];
};
