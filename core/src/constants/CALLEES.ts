import type { CalleeAddresses } from '../types';
import { getCollateralConfigByType } from './COLLATERALS';
import { getNetworkConfigByType } from '../network';

const CALLEES: Record<string, CalleeAddresses | undefined> = {
    '0x1': {
        UniswapV2CalleeDai: '0x49399BB0Fcb52b32aB5A0909206BFf7B54FF80b3',
        UniswapV2LpTokenCalleeDai: '0x74893C37beACf205507ea794470b13DE06294220',
        WstETHCurveUniv3Callee: '0xC2D837173592194131827775a6Cd88322a98C825',
        CurveLpTokenUniv3Callee: '0x71f2198849F3B1372EA90c079BD634928583f2d2',
        UniswapV3Callee: '0xdB9C76109d102d2A1E645dCa3a7E671EBfd8e11A',
        rETHCurveUniv3Callee: '0x7cdAb0fE16efb1EFE89e53B141347D7F299d6610',
        OneInchCallee: '0x19c916CDAFB41FAdd4CEd3dCf412e0302291563A',
        UniswapV2LockstakeCallee: '0xf68424845e4Af5b771356d504965A3c9257805f3',
    },
    '0x5': {
        UniswapV2CalleeDai: '0x6d9139ac89ad2263f138633de20e47bcae253938',
        UniswapV2LpTokenCalleeDai: '0x13eba3f2dd908e3624e9fb721ea9bd2f5d46f2c0',
        UniswapV3Callee: '0x323533Ad6355Ade4eCFA97E49DE7cBa27DfF1208',
    },
    '0x2a': {
        UniswapV2CalleeDai: '0x5A40F810754f725DA93e2362775a0600468f7a83',
        UniswapV2LpTokenCalleeDai: '0xDeC8b9c2829583A89f7F182DEeD7C12112dfAeD0',
        UniswapV3Callee: '0xd028e722c00434182c9558d84802bb5706219d26',
    },
};

export const getCalleesByNetworkType = function (network: string): CalleeAddresses {
    const networkConfig = getNetworkConfigByType(network);
    const chainId = networkConfig.isFork ? '0x1' : networkConfig.chainId;
    const networkCallees = CALLEES[chainId];
    if (!networkCallees) {
        throw new Error(`Can not find callee addresses for the "${network}" network`);
    }
    return networkCallees;
};

export const getCalleeAddressByCollateralType = function (
    network: string,
    collateralType: string,
    marketId: string
): string | undefined {
    const networkCallees = getCalleesByNetworkType(network);
    const collateral = getCollateralConfigByType(collateralType);
    const marketData = collateral.exchanges[marketId];
    if (!marketData || !networkCallees[marketData.callee]) {
        throw new Error(`No callee address found for the "${collateralType}" collateral on "${network}" network`);
    }
    return networkCallees[marketData.callee];
};
