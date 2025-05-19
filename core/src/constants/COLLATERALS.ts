import type { CollateralConfig, OracleCurrentAndNextPrices, OracleCurrentPriceOnly } from '../types';

export const ORACLE_WITH_DELAY: OracleCurrentAndNextPrices = {
    type: 'CurrentAndNextPrice',
    hasDelay: true,
    currentPriceSlotAddress: '0x3',
    slotPriceValueBeginsAtPosition: 34,
    nextPriceSlotAddress: '0x4',
};
export const ORACLE_WITHOUT_DELAY: OracleCurrentPriceOnly = {
    type: 'CurrentPriceOnly',
    hasDelay: false,
    currentPriceSlotAddress: '0x2',
    slotPriceValueBeginsAtPosition: 0,
    currentPriceValiditySlotAndOffset: { slot: '0x1', offset: 25 },
};

const COLLATERALS: Record<string, CollateralConfig> = {
    'ETH-A': {
        title: 'Ether',
        ilk: 'ETH-A',
        symbol: 'ETH',
        tokenName: 'ETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'ETH',
            pip: 'PIP_ETH',
            join: 'MCD_JOIN_ETH_A',
            clip: 'MCD_CLIP_ETH_A',
            calc: 'MCD_CLIP_CALC_ETH_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'ETH-B': {
        title: 'Ether',
        ilk: 'ETH-B',
        symbol: 'ETH',
        tokenName: 'ETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'ETH',
            pip: 'PIP_ETH',
            join: 'MCD_JOIN_ETH_B',
            clip: 'MCD_CLIP_ETH_B',
            calc: 'MCD_CLIP_CALC_ETH_B',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'ETH-C': {
        title: 'Ether',
        ilk: 'ETH-C',
        symbol: 'ETH',
        tokenName: 'ETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'ETH',
            pip: 'PIP_ETH',
            join: 'MCD_JOIN_ETH_C',
            clip: 'MCD_CLIP_ETH_C',
            calc: 'MCD_CLIP_CALC_ETH_C',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'USDC-A': {
        title: 'USD Coin',
        ilk: 'USDC-A',
        symbol: 'USDC',
        tokenName: 'USDC',
        decimals: 6,
        isActive: false,
        contracts: {
            token: 'USDC',
            pip: 'PIP_USDC',
            join: 'MCD_JOIN_USDC_A',
            clip: 'MCD_CLIP_USDC_A',
            calc: 'MCD_CLIP_CALC_USDC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['USDC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['USDC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITHOUT_DELAY,
    },
    'USDC-B': {
        title: 'USD Coin',
        ilk: 'USDC-B',
        symbol: 'USDC',
        tokenName: 'USDC',
        decimals: 6,
        isActive: false,
        contracts: {
            token: 'USDC',
            pip: 'PIP_USDC',
            join: 'MCD_JOIN_USDC_A',
            clip: 'MCD_CLIP_USDC_B',
            calc: 'MCD_CLIP_CALC_USDC_B',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['USDC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['USDC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITHOUT_DELAY,
    },
    'WBTC-A': {
        title: 'Wrapped Bitcoin',
        ilk: 'WBTC-A',
        symbol: 'WBTC',
        tokenName: 'WBTC',
        decimals: 8,
        isActive: true,
        contracts: {
            token: 'WBTC',
            pip: 'PIP_WBTC',
            join: 'MCD_JOIN_WBTC_A',
            clip: 'MCD_CLIP_WBTC_A',
            calc: 'MCD_CLIP_CALC_WBTC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['WBTC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['WBTC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WBTC-B': {
        title: 'Wrapped BTC',
        ilk: 'WBTC-B',
        symbol: 'WBTC',
        tokenName: 'WBTC',
        decimals: 8,
        isActive: true,
        contracts: {
            token: 'WBTC',
            pip: 'PIP_WBTC',
            join: 'MCD_JOIN_WBTC_B',
            clip: 'MCD_CLIP_WBTC_B',
            calc: 'MCD_CLIP_CALC_WBTC_B',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['WBTC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['WBTC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WBTC-C': {
        title: 'Wrapped BTC',
        ilk: 'WBTC-C',
        symbol: 'WBTC',
        tokenName: 'WBTC',
        decimals: 8,
        isActive: true,
        contracts: {
            token: 'WBTC',
            pip: 'PIP_WBTC',
            join: 'MCD_JOIN_WBTC_C',
            clip: 'MCD_CLIP_WBTC_C',
            calc: 'MCD_CLIP_CALC_WBTC_C',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['WBTC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['WBTC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WSTETH-A': {
        title: 'Lido wstETH',
        ilk: 'WSTETH-A',
        symbol: 'WSTETH',
        tokenName: 'WSTETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'WSTETH',
            pip: 'PIP_WSTETH',
            join: 'MCD_JOIN_WSTETH_A',
            clip: 'MCD_CLIP_WSTETH_A',
            calc: 'MCD_CLIP_CALC_WSTETH_A',
        },
        exchanges: {
            'Curve wstETH V3': {
                callee: 'WstETHCurveUniv3Callee',
                route: ['WSTETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WSTETH-B': {
        title: 'Lido wstETH',
        ilk: 'WSTETH-B',
        symbol: 'WSTETH',
        tokenName: 'WSTETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'WSTETH',
            pip: 'PIP_WSTETH',
            join: 'MCD_JOIN_WSTETH_B',
            clip: 'MCD_CLIP_WSTETH_B',
            calc: 'MCD_CLIP_CALC_WSTETH_B',
        },
        exchanges: {
            'Curve wstETH V3': {
                callee: 'WstETHCurveUniv3Callee',
                route: ['WSTETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2USDCETH-A': {
        title: 'UNIV2USDCETH LP',
        ilk: 'UNIV2USDCETH-A',
        symbol: 'UNIV2USDCETH',
        tokenName: 'UNIV2USDCETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2USDCETH',
            pip: 'PIP_UNIV2USDCETH',
            join: 'MCD_JOIN_UNIV2USDCETH_A',
            clip: 'MCD_CLIP_UNIV2USDCETH_A',
            calc: 'MCD_CLIP_CALC_UNIV2USDCETH_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'USDC',
                token1: 'ETH',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2DAIUSDC-A': {
        title: 'UNIV2DAIUSDC LP',
        ilk: 'UNIV2DAIUSDC-A',
        symbol: 'UNIV2DAIUSDC',
        tokenName: 'UNIV2DAIUSDC',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2DAIUSDC',
            pip: 'PIP_UNIV2DAIUSDC',
            join: 'MCD_JOIN_UNIV2DAIUSDC_A',
            clip: 'MCD_CLIP_UNIV2DAIUSDC_A',
            calc: 'MCD_CLIP_CALC_UNIV2DAIUSDC_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'DAI',
                token1: 'USDC',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'LSE-MKR-A': {
        title: 'Lockstake MKR',
        ilk: 'LSE-MKR-A',
        symbol: 'MKR',
        tokenName: 'MKR',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'MKR',
            pip: 'PIP_MKR',
            clip: 'LOCKSTAKE_CLIP_OLD_V1',
            calc: 'LOCKSTAKE_CLIP_CALC_OLD_V1',
            engine: `LOCKSTAKE_ENGINE_OLD_V1`,
        },
        exchanges: {
            'Uniswap V2': {
                callee: 'UniswapV2LockstakeCallee',
                route: ['SKY', 'USDS'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
};

export const getCollateralConfigBySymbol = function (symbol: string): CollateralConfig {
    const collateral = Object.values(COLLATERALS).find(c => c.symbol === symbol);
    if (!collateral) {
        throw new Error(`no collateral found for symbol "${symbol}"`);
    }
    return collateral;
};

export const getCollateralConfigByType = function (collateralType: string): CollateralConfig {
    const collateral = COLLATERALS[collateralType];
    if (!collateral) {
        throw new Error(`no collateral found for type "${collateralType}"`);
    }
    return collateral;
};

export const getAllCollateralSymbols = function (): string[] {
    const collateralSymbols = Object.values(COLLATERALS).map(collateral => collateral.symbol);
    return Array.from(new Set(collateralSymbols)).sort();
};

export const getAllCollateralTypes = function (): string[] {
    return Object.keys(COLLATERALS).sort();
};

export const getActiveCollateralTypes = function (): string[] {
    return Object.values(COLLATERALS)
        .filter(config => config.isActive)
        .map(config => config.ilk);
};

export default COLLATERALS;
